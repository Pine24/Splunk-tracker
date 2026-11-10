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


def main() -> int:
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0 (splunk-tracker; +https://github.com/Pine24/Splunk-tracker)"})
    try:
        raw = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"fetch failed: {e}", file=sys.stderr)
        return 1
    versions = parse(raw)
    if not versions:
        print(
            "no 10.x rows parsed; the page may be JS-rendered or its layout changed. Leaving data untouched.",
            f"(fetched {len(raw)} bytes)",
            file=sys.stderr,
        )
        return 1
    current = json.loads(OUT.read_text()) if OUT.exists() else {}
    payload = {**current, "versions": versions, "source": URL,
               "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {len(versions)} versions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
