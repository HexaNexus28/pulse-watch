"""Tests for the only code that ships to production: the tool.

An agent is untestable end to end (the model is not deterministic), so the
value is here: the tool must behave predictably whatever the model throws at it,
and it must refuse the URLs a hostile feed can put in front of it.
"""

import httpx
import pytest

from digest_agent import tools

PUBLIC_IP = "93.184.216.34"


@pytest.fixture(autouse=True)
def clear_cache():
    tools._cache.clear()


@pytest.fixture
def public_dns(monkeypatch):
    """Make every hostname resolve to a public address, without touching DNS."""
    monkeypatch.setattr(tools, "_resolve_ips", lambda host: [PUBLIC_IP])


def test_unreachable_host_returns_error_instead_of_raising(public_dns, monkeypatch):
    def refuse(*args, **kwargs):
        raise httpx.ConnectError("connection refused")

    monkeypatch.setattr(tools.httpx, "get", refuse)

    result = tools.fetch_article("https://example.com/article")

    # A dead source is ordinary input. Raising would abort the whole run and
    # lose the four other articles the agent had already curated.
    assert result["status"] == "error"
    assert "error" in result


def test_page_without_readable_body_is_reported_not_returned_empty(public_dns, monkeypatch):
    monkeypatch.setattr(tools.httpx, "get", lambda *a, **k: _Response("<html><body></body></html>"))

    result = tools.fetch_article("https://example.com/empty")

    assert result["status"] == "error"
    assert "no readable content" in result["error"]


def test_second_fetch_of_same_url_is_served_from_cache(public_dns, monkeypatch):
    calls = []

    def counting_get(*args, **kwargs):
        calls.append(args[0])
        return _Response("<html><body><article><p>" + "Un fait verifiable. " * 20 + "</p></article></body></html>")

    monkeypatch.setattr(tools.httpx, "get", counting_get)

    first = tools.fetch_article("https://example.com/a")
    second = tools.fetch_article("https://example.com/a")

    # The curator and the fact checker both open the same sources by design.
    assert first["status"] == "ok"
    assert second == first
    assert len(calls) == 1


def test_body_is_truncated_to_protect_the_context_window(public_dns, monkeypatch):
    long_body = "<html><body><article><p>" + ("Phrase de test. " * 3000) + "</p></article></body></html>"
    monkeypatch.setattr(tools.httpx, "get", lambda *a, **k: _Response(long_body))

    result = tools.fetch_article("https://example.com/long")

    assert result["status"] == "ok"
    assert len(result["text"]) <= tools._MAX_CHARS


def test_cache_does_not_grow_without_bound(public_dns, monkeypatch):
    monkeypatch.setattr(
        tools.httpx,
        "get",
        lambda *a, **k: _Response("<html><body><article><p>" + "Un fait verifiable. " * 20 + "</p></article></body></html>"),
    )

    for i in range(tools._CACHE_MAX_ENTRIES + 20):
        tools.fetch_article(f"https://example.com/{i}")

    # The service runs for weeks; an unbounded dict would keep every URL of
    # every daily run.
    assert len(tools._cache) <= tools._CACHE_MAX_ENTRIES


# --- Refus des cibles internes -------------------------------------------
# Les URLs viennent des <link> de flux RSS ajoutes par les utilisateurs, et
# l'agent tourne sur le meme hote que l'API : sans ces refus, un flux forge lit
# les services internes et le texte extrait remonte dans le digest.


@pytest.mark.parametrize(
    "url",
    [
        "http://127.0.0.1:5000/api/User",
        "http://localhost/admin",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.5/internal",
        "http://192.168.1.1/",
    ],
)
def test_internal_targets_are_refused(url, monkeypatch):
    monkeypatch.setattr(tools, "_resolve_ips", lambda host: [_first_ip(host)])
    monkeypatch.setattr(tools.httpx, "get", _must_not_be_called)

    result = tools.fetch_article(url)

    assert result["status"] == "error"
    assert result["error"].startswith("refused:")


@pytest.mark.parametrize("url", ["file:///etc/passwd", "gopher://example.com/", "ftp://example.com/x"])
def test_non_http_schemes_are_refused(url, monkeypatch):
    monkeypatch.setattr(tools.httpx, "get", _must_not_be_called)

    result = tools.fetch_article(url)

    assert result["status"] == "error"
    assert "unsupported scheme" in result["error"]


def test_public_host_redirecting_to_loopback_is_refused(monkeypatch):
    """Le premier saut est public, le second non : chaque saut doit etre revu."""
    monkeypatch.setattr(
        tools,
        "_resolve_ips",
        lambda host: [PUBLIC_IP] if host == "example.com" else ["127.0.0.1"],
    )

    def redirect_then_secret(url, *args, **kwargs):
        if "example.com" in url:
            return _Redirect("http://127.0.0.1:5000/api/User")
        raise AssertionError("le second saut n'aurait jamais du partir")

    monkeypatch.setattr(tools.httpx, "get", redirect_then_secret)

    result = tools.fetch_article("https://example.com/article")

    assert result["status"] == "error"
    assert result["error"].startswith("refused:")


def _first_ip(host: str) -> str:
    return {"localhost": "127.0.0.1"}.get(host, host)


def _must_not_be_called(*args, **kwargs):
    raise AssertionError("aucune requete ne devait partir")


class _Response:
    """Minimal stand-in for httpx.Response: what the tool actually touches."""

    is_redirect = False

    def __init__(self, text: str):
        self.text = text

    def raise_for_status(self) -> None:
        return None


class _Redirect:
    """Reponse 302 minimale : le tool ne lit que is_redirect et next_request."""

    is_redirect = True

    def __init__(self, location: str):
        self.next_request = httpx.Request("GET", location)
