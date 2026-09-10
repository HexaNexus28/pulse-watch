"""Tools exposed to the LLM.

An ADK tool is a plain typed function. ADK builds the function declaration sent
to the model from the signature and the docstring, so the docstring is not a
comment for humans: it is the prompt the model reads to decide when to call it.
Type hints must stay JSON-serialisable primitives.
"""

import ipaddress
import socket
from urllib.parse import urlparse

import httpx
import trafilatura

# RSS feeds usually ship a truncated excerpt. The whole point of this tool is to
# let the agent read the real article before claiming anything about it, so the
# same URL gets fetched by the curator and again by the fact checker. One
# process-local cache keeps that from doubling the latency and the traffic.
#
# Bounded: this service is long-lived and every distinct URL of every daily run
# would otherwise stay in memory for the life of the process.
_cache: dict[str, dict] = {}
_CACHE_MAX_ENTRIES = 512

_MAX_CHARS = 6000
_MAX_REDIRECTS = 5
_HEADERS = {"User-Agent": "PulseWatch/1.0 (+https://github.com/HexaNexus28/pulse-watch)"}


def _resolve_ips(host: str) -> list[str]:
    """Every address `host` resolves to. Isolated so tests can substitute it."""
    return [info[4][0] for info in socket.getaddrinfo(host, None)]


def _reject_reason(url: str) -> str | None:
    """Why this URL must not be fetched, or None when it is safe to fetch.

    The URLs reaching this tool come from the <link> elements of RSS feeds that
    users add themselves, so they are attacker-controlled. The agent runs on the
    same host as the API, bound to loopback: without this check a crafted feed
    turns it into a proxy onto internal services and cloud metadata endpoints,
    and the extracted body comes back inside the digest the user reads.

    Resolution happens here and the connection happens later, so a name that
    changes answers in between can still slip past (DNS rebinding). Closing that
    needs pinning the checked address at connect time; this covers the direct
    case, which is the one a feed can trigger on its own.
    """
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        return f"unsupported scheme {parsed.scheme!r}: only http and https are fetched"

    if not parsed.hostname:
        return "no host in URL"

    try:
        addresses = _resolve_ips(parsed.hostname)
    except OSError as exc:
        return f"cannot resolve {parsed.hostname}: {exc}"

    for address in addresses:
        ip = ipaddress.ip_address(address)
        # Not `not ip.is_global`: that also rejects addresses which are merely
        # unallocated, while these are the ranges that actually reach something
        # on the host or on its network.
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            return f"{parsed.hostname} resolves to non-public address {address}"

    return None


def _get_checked(url: str) -> httpx.Response:
    """GET `url`, re-checking every redirect hop against _reject_reason.

    httpx's own follow_redirects would jump straight to whatever Location says,
    including back into the private ranges the first check just refused, so the
    hops are walked here instead.
    """
    for _ in range(_MAX_REDIRECTS):
        reason = _reject_reason(url)
        if reason is not None:
            raise PermissionError(reason)

        response = httpx.get(url, headers=_HEADERS, timeout=15.0, follow_redirects=False)
        if not response.is_redirect:
            response.raise_for_status()
            return response

        url = str(response.next_request.url)

    raise PermissionError(f"more than {_MAX_REDIRECTS} redirects")


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
        response = _get_checked(url)
    except PermissionError as exc:
        # Refused on purpose. Same shape as any other failure so the model reads
        # it and moves to another source instead of retrying.
        return {"status": "error", "url": url, "error": f"refused: {exc}"}
    except httpx.HTTPError as exc:
        # Returned, not raised: a dead source is normal input, not a crash. The
        # model reads this and moves on to another source.
        return {"status": "error", "url": url, "error": str(exc)}

    text = trafilatura.extract(response.text, include_comments=False, include_tables=False)
    if not text:
        return {"status": "error", "url": url, "error": "no readable content extracted"}

    result = {"status": "ok", "url": url, "text": text[:_MAX_CHARS]}

    if len(_cache) >= _CACHE_MAX_ENTRIES:
        # A run reads a few dozen URLs, so the cap is never reached inside one
        # digest: dropping the oldest entry only ever discards a previous run's.
        _cache.pop(next(iter(_cache)))
    _cache[url] = result

    return result
