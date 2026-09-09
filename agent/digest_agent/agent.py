"""Daily digest agent.

    START -> curator -> writer -> checker -> gate
                          ^                   |
                          |  "retry"          | "ok"
                          +-------------------+
                                              -> packager

Built on Workflow, the graph engine, and not on SequentialAgent/LoopAgent:
ADK 2.8 marks those deprecated ("will be removed in a future version"), and a
new service should not be born on an API with a removal date.

Two things are deliberately NOT left to a model:
  - the loop decision: gate is plain Python reading the checker's verdict, so a
    model that forgets to call a tool cannot hang the pipeline;
  - the attempt cap: also in gate, so a checker that stays unhappy still ships.
"""

import os

from google.adk import Workflow
from google.adk.agents import Context, LlmAgent
from google.adk.models.lite_llm import LiteLlm

from .prompts import CURATOR, FACT_CHECKER, PACKAGER, WRITER
from .schemas import Digest
from .tools import fetch_article

MODEL = os.environ.get("DIGEST_MODEL", "gemini-2.5-flash")

# One rewrite is worth it, a second rarely is, and the digest must ship daily.
MAX_ATTEMPTS = 2


def _model(name: str):
    """Gemini is native to ADK; anything else is routed through LiteLLM."""
    return name if name.startswith("gemini") else LiteLlm(model=name)


def gate(ctx: Context) -> dict:
    """Route the graph: publish the draft, or send it back to the writer."""
    review = str(ctx.state.get("review") or "").strip()
    attempts = int(ctx.state.get("attempts") or 0) + 1
    ctx.state["attempts"] = attempts

    # The checker is instructed to answer exactly "OK" when nothing is
    # unsupported. Reading that token here is more reliable than hoping the
    # model calls an exit tool, which is where small models fail first.
    verified = review.upper().startswith("OK")
    exhausted = attempts >= MAX_ATTEMPTS

    ctx.route = "ok" if verified or exhausted else "retry"
    return {"attempts": attempts, "verified": verified, "route": ctx.route}


curator = LlmAgent(
    name="curator",
    model=_model(MODEL),
    description="Groups duplicate stories, drops noise, keeps the 3-5 that matter.",
    instruction=CURATOR,
    tools=[fetch_article],
    output_key="selection",
)

writer = LlmAgent(
    name="writer",
    model=_model(MODEL),
    description="Turns the selection into a sourced French digest.",
    instruction=WRITER,
    output_key="draft",
)

checker = LlmAgent(
    name="checker",
    model=_model(MODEL),
    description="Reopens the sources and reports every unsupported claim.",
    instruction=FACT_CHECKER,
    tools=[fetch_article],
    output_key="review",
)

# An agent carrying an output_schema cannot own tools in ADK, hence a last,
# toolless node whose only job is to shape validated text into the contract.
packager = LlmAgent(
    name="packager",
    model=_model(MODEL),
    description="Serialises the validated digest into the Digest contract.",
    instruction=PACKAGER,
    output_schema=Digest,
    output_key="digest",
)

root_agent = Workflow(
    name="daily_digest",
    description="Turns raw RSS articles into a deduplicated, sourced French digest.",
    edges=[
        ("START", curator, writer, checker, gate),
        (gate, {"ok": packager, "retry": writer}),
    ],
)
