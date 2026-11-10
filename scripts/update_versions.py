#!/usr/bin/env python3
"""Refresh public/data/versions.json from the official Splunk Software Support Policy page.

The "Core" table has six columns:
  Version | Release Date | Enterprise EOS date | Enterprise criteria | Cloud EOS date | Cloud criteria
Cloud-only releases (10.1, 10.3, ...) carry "Not Released" in the Enterprise columns.

Handles both raw HTML (<tr>/<td>) and pipe-delimited text. Fail-safe: if the page can't be fetched
or no 10.x rows are parsed, the existing JSON is left untouched and the script exits non-zero.
"""
import html
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL = "https://www.splunk.com/en_us/legal/splunk-software-support-policy.html"
FALLBACK_URL = "https://endoflife.date/api/splunk.json"  # community-maintained, lags the official table
OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "versions.json"
VERSION = re.compile(r"^\d{1,2}\.\d{1,2}$")  # minor versions only; skips 9.0.2305-style Cloud builds
DATE = re.compile(r"^[A-Z][a-z]{2} \d{1,2},? \d{4}$")
MIN_MAJOR = 10  # tracker starts at Splunk 10


def to_text(raw: str) -> str:
    t = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", raw)
    t = re.sub(r"(?i)</t[dh]\s*>", " | ", t)
    t = re.sub(r"(?i)</tr\s*>", "\n", t)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    return html.unescape(t).replace("\xa0", " ")


def iso(s: str):
    return datetime.strptime(s.replace(",", ""), "%b %d %Y").strftime("%Y-%m-%d") if DATE.match(s) else None


def parse(raw: str) -> list[dict]:
    found = {}
    for line in to_text(raw).splitlines():
        if "|" not in line:
            continue
        cells = [re.sub(r"\s+", " ", c).strip() for c in line.split("|")]
        while cells and not cells[0]:
            cells.pop(0)
        if len(cells) < 5 or not VERSION.match(cells[0]) or not DATE.match(cells[1]):
            continue
        if int(cells[0].split(".")[0]) < MIN_MAJOR:
            continue
        found[cells[0]] = {
            "version": cells[0],
            "released": iso(cells[1]),
            "endOfSupport": iso(cells[2]),          # Enterprise; None => Cloud-only release
            "cloudEndOfSupport": iso(cells[4]),
        }
    return sorted(found.values(), key=lambda v: [int(x) for x in v["version"].split(".")], reverse=True)


def merge_fallback(existing: list[dict], feed: list[dict]) -> list[dict]:
    """Update/insert Enterprise cycles >= MIN_MAJOR from endoflife.date; never delete existing entries
    (the feed lacks Cloud-only releases and newer cycles)."""
    by_ver = {v["version"]: dict(v) for v in existing}
    for c in feed:
        ver, eol, rel = str(c.get("cycle")), c.get("eol"), c.get("releaseDate")
        if not VERSION.match(ver) or int(ver.split(".")[0]) < MIN_MAJOR or not isinstance(eol, str):
            continue
        entry = by_ver.setdefault(ver, {"version": ver, "cloudEndOfSupport": None})
        entry.update({"released": rel, "endOfSupport": eol})
    return sorted(by_ver.values(), key=lambda v: [int(x) for x in v["version"].split(".")], reverse=True)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (splunk-tracker; +https://github.com/Pine24/Splunk-tracker)"})
    return urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")


def main() -> int:
    current = json.loads(OUT.read_text()) if OUT.exists() else {}
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    versions, source = [], URL
    try:
        versions = parse(fetch(URL))
        if not versions:
            print("official page fetched but no 10.x rows parsed (JS-rendered or layout changed)", file=sys.stderr)
    except Exception as e:  # noqa: BLE001
        print(f"official fetch failed: {e}", file=sys.stderr)
    if not versions:
        try:
            versions = merge_fallback(current.get("versions", []), json.loads(fetch(FALLBACK_URL)))
            source = f"{FALLBACK_URL} (fallback; official policy page unreachable)"
            print("::warning::Official support policy page unavailable; used endoflife.date fallback")
        except Exception as e:  # noqa: BLE001
            print(f"fallback failed too: {e}. Leaving data untouched.", file=sys.stderr)
            return 1
    payload = {**current, "versions": versions, "source": source, "generated": stamp}
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {len(versions)} versions from {source}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
