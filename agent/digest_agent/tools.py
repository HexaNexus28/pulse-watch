"""Tools exposed to the LLM.

An ADK tool is a plain typed function. ADK builds the function declaration sent
to the model from the signature and the docstring, so the docstring is not a
comment for humans: it is the prompt the model reads to decide when to call it.
Type hints must stay JSON-serialisable primitives.
"""

import httpx
import trafilatura

# RSS feeds usually ship a truncated excerpt. The whole point of this tool is to
# let the agent read the real article before claiming anything about it, so the
# same URL gets fetched by the curator and again by the fact checker. One
# process-local cache keeps that from doubling the latency and the traffic.
_cache: dict[str, dict] = {}

_MAX_CHARS = 6000
_HEADERS = {"User-Agent": "PulseWatch/1.0 (+https://github.com/HexaNexus28/pulse-watch)"}


def fetch_article(url: str) -> dict:
    """Read the full text of an article from its URL.

    Use it when an RSS excerpt is truncated or ambiguous, and to verify that a
    claim you are about to write is actually supported by the source.

    Args:
        url: Absolute http(s) URL of the article.

    Returns:
        status: "ok" or "error".
        text: readable body of the article, truncated to 6000 characters.
        error: reason, when status is "error".
    """
    if url in _cache:
        return _cache[url]

    try:
        response = httpx.get(url, headers=_HEADERS, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        # Returned, not raised: a dead source is normal input, not a crash. The
        # model reads this and moves on to another source.
        return {"status": "error", "url": url, "error": str(exc)}

    text = trafilatura.extract(response.text, include_comments=False, include_tables=False)
    if not text:
        return {"status": "error", "url": url, "error": "no readable content extracted"}

    result = {"status": "ok", "url": url, "text": text[:_MAX_CHARS]}
    _cache[url] = result
    return result
