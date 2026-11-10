# Splunk Tracker

A free, static site tracking Splunk lifecycle info. Hosted on GitHub Pages, data refreshed daily by GitHub Actions.

## Status
- [x] Splunk 10+ versions with end-of-support countdown colors, plus an exact-version checker (10.2.4 resolves to 10.2)
- [x] Docs map with keyword filter (seed list, grow via crawl)
- [x] Quick links (Crontab Guru, Regex101, ...)

## Develop
```
npm install
npm run dev      # local dev server
npm test         # color/date logic tests
npm run build
python -m pytest scripts   # scraper tests
```

## Data
`public/data/versions.json` is rewritten by `scripts/update_versions.py` (workflow: *Refresh data*).
If the official page layout changes the script fails loudly and leaves the data untouched.
The seed data was entered by hand and must be verified against the
[official support policy](https://www.splunk.com/en_us/legal/splunk-software-support-policy.html).
