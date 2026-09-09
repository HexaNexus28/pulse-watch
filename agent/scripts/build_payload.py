"""Build a payload identical to what PulseWatch.Business will POST.

Not part of the service: it exists so the agent can be exercised end to end on
real articles without booting the .NET API and its SQL Server.

    python scripts/build_payload.py payload.json

Writes the file itself rather than to stdout: on Windows a redirected stdout
encodes in cp1252 and mangles every accent.
"""

import json
import re
import sys
import xml.etree.ElementTree as ET

import httpx

# Same feeds the backend seeds, so the test input matches production input.
FEEDS = {
    ".NET Blog": "https://devblogs.microsoft.com/dotnet/feed/",
    "The Verge": "https://www.theverge.com/rss/index.xml",
    "Hacker News": "https://hnrss.org/frontpage",
}
PER_FEED = 6
NS = {"atom": "http://www.w3.org/2005/Atom"}


_TAGS = re.compile(r"<[^>]+>")


def _clean(html: str) -> str:
    """RSS excerpts ship raw HTML. The agent must read prose, not markup."""
    return _TAGS.sub(" ", html).replace("&nbsp;", " ").strip()


def _text(node, *paths):
    for path in paths:
        found = node.find(path, NS)
        if found is not None and (found.text or found.get("href")):
            return (found.text or found.get("href", "")).strip()
    return ""


def parse(xml: str, source: str) -> list[dict]:
    root = ET.fromstring(xml)
    # One parser for both formats: RSS puts items under channel, Atom uses entry.
    nodes = root.findall(".//item") or root.findall(".//atom:entry", NS)
    articles = []
    for node in nodes[:PER_FEED]:
        articles.append(
            {
                "title": _text(node, "title", "atom:title"),
                "excerpt": _clean(_text(node, "description", "atom:summary", "atom:content"))[:600],
                "url": _text(node, "link", "atom:link"),
                "source": source,
            }
        )
    return articles


def main() -> None:
    articles = []
    for source, url in FEEDS.items():
        response = httpx.get(url, timeout=20.0, follow_redirects=True,
                             headers={"User-Agent": "PulseWatch/1.0"})
        response.raise_for_status()
        articles.extend(parse(response.text, source))

    destination = sys.argv[1] if len(sys.argv) > 1 else "payload.json"
    with open(destination, "w", encoding="utf-8") as handle:
        json.dump({"category": "Dev & Tech", "articles": articles},
                  handle, ensure_ascii=False, indent=2)
    print(f"{len(articles)} articles -> {destination}")


if __name__ == "__main__":
    main()
