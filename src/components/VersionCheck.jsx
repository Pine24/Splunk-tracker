import { useState } from 'react'
import { eolColor, eolLabel } from '../lib/eol.js'
import { lookupVersion } from '../lib/lookup.js'

const MESSAGES = {
  invalid: 'Enter a version like 10.2.4 or 10.6.0.5.',
  unknown: (r) => `${r.minor} is not tracked here (this tracker covers Splunk 10 and later).`,
  'cloud-only': (r) => `${r.minor} is a Splunk Cloud Platform-only release; it has no Splunk Enterprise end-of-support date.`,
}

export default function VersionCheck({ versions }) {
  const [q, setQ] = useState('')
  const r = lookupVersion(q, versions)
  const msg = MESSAGES[r.status]
  return (
    <div className="check">
      <label>
        Check your exact version
        <input
          type="text"
          className="search"
          placeholder="e.g. 10.2.4"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Splunk version to check"
        />
      </label>
      {r.status === 'ok' && (
        <p>
          <strong>{q.trim()}</strong> belongs to {r.minor}, supported until {r.entry.endOfSupport}{' '}
          <span className="badge" style={{ background: eolColor(r.days) }}>{eolLabel(r.days)}</span>
        </p>
      )}
      {msg && <p className="meta">{typeof msg === 'function' ? msg(r) : msg}</p>}
    </div>
  )
}
