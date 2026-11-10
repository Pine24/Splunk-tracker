import { daysLeft, eolColor, eolLabel } from '../lib/eol.js'

export default function Versions({ data }) {
  const rows = [...data.versions]
    .map((v) => ({ ...v, days: daysLeft(v.endOfSupport) }))
    .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))

  return (
    <>
      <div className="cards">
        {rows.map((v) => (
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
      <p className="meta">
        Data updated {data.generated?.slice(0, 10)} · source: {data.source}
      </p>
      {data.notes && <p className="meta">{data.notes}</p>}
    </>
  )
}
