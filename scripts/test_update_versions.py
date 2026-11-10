import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from update_versions import parse, merge_fallback

MARKDOWN = """
| Version | Release Date | End of Splunk Enterprise Support Date | Criteria | End of Cloud Support Date | Criteria |
| --- | --- | --- | --- | --- | --- |
| 9.4 | Dec 16 2024 | Dec 16 2026 | 24 Months | Not Released | Not Released |
| 9.3.2411 | Mar 24 2025 | Not Released | Not Released | Mar 24 2026 | 12 Months |
| 10.0 | Jul 28 2025 | Jul 28 2027 | 24 Months | Jul 28 2026 | 12 Months |
| 10.1 | Oct 28 2025 | Not Released | Not Released | Oct 28 2026 | 12 Months |
| 10.6 | Sep 30 2026 | Sep 30 2028 | 24 Months | Sep 30 2027 | 12 Months |
"""

HTML = """<table><tr><th>Version</th><th>Release Date</th></tr>
<tr><td> 10.2 </td><td>Jan&nbsp;15 2026</td><td><p>Jan 15 2028</p></td><td>24 Months</td><td>Jan 15 2027</td><td>12 Months</td></tr>
<tr><td>10.3</td><td>Mar 24 2026</td><td>Not Released</td><td>Not Released</td><td>Mar 24 2027</td><td>12 Months</td></tr></table>"""


def test_markdown_sorted_skips_pre10_and_cloud_builds():
    v = parse(MARKDOWN)
    assert [x["version"] for x in v] == ["10.6", "10.1", "10.0"]
    assert v[0]["endOfSupport"] == "2028-09-30"


def test_cloud_only_has_no_enterprise_eos():
    v = {x["version"]: x for x in parse(MARKDOWN)}
    assert v["10.1"]["endOfSupport"] is None
    assert v["10.1"]["cloudEndOfSupport"] == "2026-10-28"


def test_raw_html():
    v = {x["version"]: x for x in parse(HTML)}
    assert v["10.2"]["released"] == "2026-01-15" and v["10.2"]["endOfSupport"] == "2028-01-15"
    assert v["10.3"]["endOfSupport"] is None


def test_fallback_merge_keeps_unknown_and_updates_known():
    existing = [
        {"version": "10.6", "released": "2026-09-30", "endOfSupport": "2028-09-30", "cloudEndOfSupport": "2027-09-30"},
        {"version": "10.4", "released": "2026-05-18", "endOfSupport": "2028-05-18", "cloudEndOfSupport": "2027-05-18"},
    ]
    feed = [{"cycle": "10.4", "releaseDate": "2026-05-18", "eol": "2028-05-19"},
            {"cycle": "10.8", "releaseDate": "2027-01-01", "eol": "2029-01-01"},
            {"cycle": "9.4", "releaseDate": "2024-12-16", "eol": "2026-12-16"}]
    out = {v["version"]: v for v in merge_fallback(existing, feed)}
    assert set(out) == {"10.8", "10.6", "10.4"}          # 9.4 skipped, 10.6 kept
    assert out["10.4"]["endOfSupport"] == "2028-05-19"
    assert out["10.4"]["cloudEndOfSupport"] == "2027-05-18"  # cloud data preserved
