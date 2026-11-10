#!/usr/bin/env python3
"""Refresh public/data/splunkbase.json for the apps in scripts/watchlist.json.

Per app we call the public Splunkbase API:
  /api/v1/app/<id>/            -> title, updated_time
  /api/v1/app/<id>/release/    -> releases: name (= version), published_datetime, release_notes (HTML,
                                  usually just links to docs), product_versions (compatible Splunk versions)
Fail-safe: if one app fails, its previous entry is kept. Exit code is 1 only if every app failed.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data" / "splunkbase.json"
WATCHLIST = ROOT / "scripts" / "watchlist.json"
API = "https://splunkbase.splunk.com/api/v1/app"
KEEP = 5  # releases kept per app
UA = "Mozilla/5.0 (splunk-tracker; +https://github.com/Pine24/Splunk-tracker)"


def get_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read().decode("utf-8"))


def notes_links(html_text) -> list[str]:
    return re.findall(r'href=["\']([^"\']+)["\']', html_text or "", flags=re.I)


def normalize_release(r: dict) -> dict:
    pv = r.get("product_versions") or []
    return {
        "version": str(r.get("name", "")),
        "published": (r.get("published_datetime") or r.get("created_datetime") or "")[:10],
        "notesUrl": (notes_links(r.get("release_notes")) or [None])[0],
        "splunkVersions": [str(x) for x in pv] if isinstance(pv, list) else [],
        "cloudCompatible": r.get("cloud_compatible"),
    }


def parse_releases(payload) -> list[dict]:
    items = payload.get("results", []) if isinstance(payload, dict) else payload
    rel = [normalize_release(r) for r in items if isinstance(r, dict) and r.get("name")]
    rel.sort(key=lambda r: r["published"], reverse=True)
    return rel[:KEEP]


def fetch_app(entry: dict) -> dict:
    meta = get_json(f"{API}/{entry['id']}/")
    releases = parse_releases(get_json(f"{API}/{entry['id']}/release/"))
    if not releases:
        raise ValueError("no releases returned")
    return {
        "id": entry["id"],
        "name": entry["name"],
        "title": meta.get("title", entry["name"]),
        "url": f"https://splunkbase.splunk.com/app/{entry['id']}/",
        "updated": (meta.get("updated_time") or "")[:10],
        "releases": releases,
    }


def main() -> int:
    watch = json.loads(WATCHLIST.read_text())
    current = json.loads(OUT.read_text()) if OUT.exists() else {"apps": []}
    old = {a["id"]: a for a in current.get("apps", [])}
    apps, ok = [], 0
    for entry in watch:
        try:
            apps.append(fetch_app(entry))
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"app {entry['id']} ({entry['name']}) failed: {e}; keeping previous entry", file=sys.stderr)
            apps.append(old.get(entry["id"]) or {"id": entry["id"], "name": entry["name"],
                        "url": f"https://splunkbase.splunk.com/app/{entry['id']}/", "releases": []})
    if ok == 0:
        print("all apps failed; leaving file untouched", file=sys.stderr)
        return 1
    payload = {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
               "source": "https://splunkbase.splunk.com/api/v1/app/", "apps": apps}
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"updated {ok}/{len(watch)} apps")
    return 0


if __name__ == "__main__":
    sys.exit(main())
