"""Output contract of the digest agent.

The .NET backend owns the database; this service owns nothing but the
transformation. These models are therefore the *only* coupling point between
the two, and must stay stable: PulseWatch.Business maps them onto Summary.
"""

from pydantic import BaseModel, Field


class DigestItem(BaseModel):
    headline: str = Field(
        description="One sentence stating what happened. Not the article title copied."
    )
    why_it_matters: str = Field(
        description="Two sentences max: the consequence for someone following this field."
    )
    sources: list[str] = Field(
        description="URLs actually used to support this item. Never empty."
    )


class Digest(BaseModel):
    category: str
    items: list[DigestItem] = Field(description="Ranked by importance, 3 to 5 items.")
    dropped_count: int = Field(
        description="Articles discarded as duplicates or noise. Proof the agent filtered."
    )
