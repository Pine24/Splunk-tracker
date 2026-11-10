#!/usr/bin/env python3
"""Refresh public/data/versions.json from the official Splunk Software Support Policy page.

Fail-safe by design: if the page can't be fetched or no Enterprise rows are parsed,
the existing JSON is left untouched and the script exits non-zero so the workflow shows red.
Expected table row shape (as rendered on the policy page):
    10.2 | Jan 15 2026 | Jan 15 2028 | ...
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

URL = "https://www.splunk.com/en_us/legal/splunk-software-support-policy.html"
OUT = Path(__file__).resolve().parent.parent / "public" / "data" / "versions.json"
ROW = re.compile(
    r"\b(\d{1,2}\.\d{1,2})\s*\|\s*([A-Z][a-z]{2} \d{1,2},? \d{4})\s*\|\s*([A-Z][a-z]{2} \d{1,2},? \d{4})"
)


def iso(s: str) -> str:
    return datetime.strptime(s.replace(",", ""), "%b %d %Y").strftime("%Y-%m-%d")


def parse(text: str) -> list[dict]:
    found = {}
    for ver, rel, eos in ROW.findall(text):
        if int(ver.split(".")[0]) < 10:  # tracker starts at Splunk 10
            continue
        found[ver] = {"version": ver, "released": iso(rel), "endOfSupport": iso(eos), "enterprise": True}
    return sorted(found.values(), key=lambda v: [int(x) for x in v["version"].split(".")], reverse=True)


def main() -> int:
    req = urllib.request.Request(URL, headers={"User-Agent": "splunk-tracker/0.1"})
    try:
        text = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"fetch failed: {e}", file=sys.stderr)
        return 1
    versions = parse(text)
    if not versions:
        print("no version rows parsed; page layout may have changed. Leaving data untouched.", file=sys.stderr)
        return 1
    current = json.loads(OUT.read_text()) if OUT.exists() else {}
    payload = {**current, "versions": versions, "source": URL,
               "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {len(versions)} versions")
    return 0


if __name__ == "__main__":
    sys.exit(main())
