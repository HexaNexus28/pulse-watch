"""Tests for the only code that ships to production: the tool.

An agent is untestable end to end (the model is not deterministic), so the
value is here: the tool must behave predictably whatever the model throws at it.
"""

import httpx
import pytest

from digest_agent import tools


@pytest.fixture(autouse=True)
def clear_cache():
    tools._cache.clear()


def test_unreachable_host_returns_error_instead_of_raising():
    # Port 9 is the discard port: refused immediately, no network needed.
    result = tools.fetch_article("http://127.0.0.1:9/article")

    # A dead source is ordinary input. Raising would abort the whole run and
    # lose the four other articles the agent had already curated.
    assert result["status"] == "error"
    assert "error" in result


def test_page_without_readable_body_is_reported_not_returned_empty(monkeypatch):
    monkeypatch.setattr(tools.httpx, "get", lambda *a, **k: _Response("<html><body></body></html>"))

    result = tools.fetch_article("https://example.com/empty")

    assert result["status"] == "error"
    assert "no readable content" in result["error"]


def test_second_fetch_of_same_url_is_served_from_cache(monkeypatch):
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


def test_body_is_truncated_to_protect_the_context_window(monkeypatch):
    long_body = "<html><body><article><p>" + ("Phrase de test. " * 3000) + "</p></article></body></html>"
    monkeypatch.setattr(tools.httpx, "get", lambda *a, **k: _Response(long_body))

    result = tools.fetch_article("https://example.com/long")

    assert result["status"] == "ok"
    assert len(result["text"]) <= tools._MAX_CHARS


class _Response:
    """Minimal stand-in for httpx.Response: what the tool actually touches."""

    def __init__(self, text: str):
        self.text = text

    def raise_for_status(self) -> None:
        return None
