const DAY = 86400000
const num = (a, b) => a.localeCompare(b, undefined, { numeric: true })
const recent = (iso) => iso && Date.now() - new Date(iso).getTime() < 30 * DAY

export default function Splunkbase({ data }) {
  const apps = [...data.apps].sort((a, b) =>
    (b.releases[0]?.published || '').localeCompare(a.releases[0]?.published || ''))
  return (
    <>
      <div className="cards">
        {apps.map((a) => {
          const latest = a.releases[0]
          return (
            <article key={a.id} className="card">
              <h3><a href={a.url} target="_blank" rel="noreferrer">{a.title || a.name}</a></h3>
              {latest ? (
                <>
                  <p>
                    Latest <strong>{latest.version}</strong> · {latest.published}{' '}
                    {recent(latest.published) && <span className="badge new">new</span>}
                  </p>
                  {latest.notesUrl && (
                    <p><a href={latest.notesUrl} target="_blank" rel="noreferrer">Release notes</a></p>
                  )}
                  {latest.splunkVersions.length > 0 && (() => {
                    const sv = [...latest.splunkVersions].sort(num)
                    return <p className="meta">Splunk {sv[0]} – {sv[sv.length - 1]}</p>
                  })()}
                  {a.releases.length > 1 && (
                    <details className="patches">
                      <summary>Recent releases</summary>
                      <ul>
                        {a.releases.map((r) => (
                          <li key={r.version}>
                            {r.notesUrl ? <a href={r.notesUrl} target="_blank" rel="noreferrer">{r.version}</a> : r.version} · {r.published}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </>
              ) : (
                <p className="meta">Waiting for the first data refresh.</p>
              )}
            </article>
          )
        })}
      </div>
      <p className="meta">Data updated {data.generated?.slice(0, 10)} · source: {data.source}</p>
    </>
  )
}
