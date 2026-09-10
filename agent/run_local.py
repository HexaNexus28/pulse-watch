"""Run the agent on a payload file and print the full trace.

    python run_local.py payload.json

This is the pedagogical entry point: adk web shows the same thing in a browser,
but here every moving part is explicit. A Runner takes an agent graph, a session
service holding the state, and turns one user message into a stream of events.
Each event carries either text, a tool call, or a tool result.
"""

import asyncio
import json
import sys

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from digest_agent.agent import root_agent

APP_NAME = "pulsewatch"
USER_ID = "local"


async def main(path: str) -> None:
    payload = open(path, encoding="utf-8").read()

    # In memory: the state lives for this process only. Swap for
    # DatabaseSessionService the day a conversation must survive a restart.
    sessions = InMemorySessionService()
    session = await sessions.create_session(app_name=APP_NAME, user_id=USER_ID)
    # node=, not agent=: a Workflow is a BaseNode, not a BaseAgent.
    runner = Runner(app_name=APP_NAME, node=root_agent, session_service=sessions)

    message = types.Content(role="user", parts=[types.Part(text=payload)])

    async for event in runner.run_async(
        user_id=USER_ID, session_id=session.id, new_message=message
    ):
        for part in (event.content.parts if event.content else []):
            if part.function_call:
                print(f"  [{event.author}] -> {part.function_call.name}({part.function_call.args})")
            elif part.function_response:
                response = str(part.function_response.response)
                print(f"  [{event.author}] <- {response[:160]}")
            elif part.text and part.text.strip():
                print(f"\n=== {event.author} ===\n{part.text.strip()}\n")

    final = await sessions.get_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=session.id
    )
    print("\n=== state['digest'] ===")
    print(json.dumps(final.state.get("digest"), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else "payload.json"))
