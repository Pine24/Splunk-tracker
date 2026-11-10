import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from update_versions import parse

SAMPLE = """
6.0 | Oct 1 2013 | Oct 22 2019 | Splunk Enterprise 8.0 Release |
10.0 | Jul 28 2025 | Jul 28 2027 | 24 months |
10.2 | Jan 15 2026 | Jan 15 2028 | 24 months |
"""

def test_parse_skips_pre_10_and_sorts():
    v = parse(SAMPLE)
    assert [x["version"] for x in v] == ["10.2", "10.0"]
    assert v[0]["endOfSupport"] == "2028-01-15"
