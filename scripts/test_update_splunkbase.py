import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from update_splunkbase import notes_links, parse_releases

RELEASES = [
    {"name": "4.1.4", "published_datetime": "2025-12-22T17:38:25Z", "release_notes": "", "product_versions": ["10.1", "9.0"]},
    {"name": "4.3.0", "published_datetime": "2026-05-11T10:18:34Z",
     "release_notes": '<p>See <a href="https://help.splunk.com/x/4.3">release notes</a></p>',
     "product_versions": ["10.6", "9.0"], "cloud_compatible": True},
]


def test_sorted_newest_first_and_notes_link():
    r = parse_releases(RELEASES)
    assert [x["version"] for x in r] == ["4.3.0", "4.1.4"]
    assert r[0]["notesUrl"] == "https://help.splunk.com/x/4.3"
    assert r[1]["notesUrl"] is None
    assert r[0]["published"] == "2026-05-11"


def test_accepts_dict_wrapper_and_limits():
    many = [{"name": f"1.{i}", "published_datetime": f"2026-01-{i+1:02d}T00:00:00Z"} for i in range(9)]
    assert len(parse_releases({"results": many})) == 5


def test_notes_links_handles_none():
    assert notes_links(None) == []
