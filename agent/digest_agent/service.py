"""HTTP surface consumed by PulseWatch.Business.

Deliberately NOT `adk api_server`: that one exposes ADK's own session API, so
the .NET side would have to create a session, post a message, then poll events,
and ADK's session concept would leak into a service that has no conversation.
One POST in, one Digest out.
"""

import json

from fastapi import FastAPI, HTTPException
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel, Field

from .agent import root_agent
from .schemas import Digest

APP_NAME = "pulsewatch"

app = FastAPI(title="PulseWatch digest agent")
_sessions = InMemorySessionService()
_runner = Runner(app_name=APP_NAME, node=root_agent, session_service=_sessions)


class Article(BaseModel):
    title: str
    excerpt: str
    url: str
    source: str


class DigestRequest(BaseModel):
    category: str
    # Below ~5 articles there is nothing to deduplicate and the agent adds no
    # value over the existing code path; above ~40 the curator's context blows.
    articles: list[Article] = Field(min_length=5, max_length=40)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/digest", response_model=Digest)
async def digest(request: DigestRequest) -> Digest:
    # One throwaway session per request: this endpoint holds no conversation,
    # the state only has to live long enough for the graph to traverse.
    session = await _sessions.create_session(app_name=APP_NAME, user_id="pulsewatch")
    message = types.Content(
        role="user",
        parts=[types.Part(text=request.model_dump_json())],
    )

    async for _ in _runner.run_async(
        user_id="pulsewatch", session_id=session.id, new_message=message
    ):
        pass

    final = await _sessions.get_session(
        app_name=APP_NAME, user_id="pulsewatch", session_id=session.id
    )
    produced = final.state.get("digest")
    if not produced:
        # The graph ran but the packager produced nothing: an upstream model
        # error. 502 rather than 500 - the fault is the model provider's.
        raise HTTPException(status_code=502, detail="agent produced no digest")

    return Digest.model_validate(
        json.loads(produced) if isinstance(produced, str) else produced
    )
