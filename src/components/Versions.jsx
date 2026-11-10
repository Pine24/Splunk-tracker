import VersionCheck from './VersionCheck.jsx'
import { daysLeft, eolColor, eolLabel } from '../lib/eol.js'

const byVersionDesc = (a, b) => b.version.localeCompare(a.version, undefined, { numeric: true })

export default function Versions({ data }) {
  const enterprise = data.versions
    .filter((v) => v.endOfSupport)
    .map((v) => ({ ...v, days: daysLeft(v.endOfSupport) }))
    .sort(byVersionDesc)
  const cloudOnly = data.versions.filter((v) => !v.endOfSupport).sort(byVersionDesc)

  return (
    <>
      <VersionCheck versions={data.versions} />
      <div className="cards">
        {enterprise.map((v) => (
          <article key={v.version} className="card" style={{ borderColor: eolColor(v.days) }}>
            <h3>Splunk {v.version}</h3>
            <p>Released {v.released}</p>
            <p>End of support {v.endOfSupport}</p>
            <span className="badge" style={{ background: eolColor(v.days) }}>
              {eolLabel(v.days)}
            </span>
          </article>
        ))}
      </div>
      {cloudOnly.length > 0 && (
        <details className="cloud">
          <summary>Splunk Cloud Platform-only releases ({cloudOnly.length})</summary>
          <ul>
            {cloudOnly.map((v) => (
              <li key={v.version}>
                {v.version}: released {v.released}, Cloud support ends {v.cloudEndOfSupport}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="meta">
        Data updated {data.generated?.slice(0, 10)} · source: {data.source}
      </p>
      {data.notes && <p className="meta">{data.notes}</p>}
    </>
  )
}
