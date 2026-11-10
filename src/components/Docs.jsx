import { useState } from 'react'
import { filterDocs, groupBy } from '../lib/filter.js'

export default function Docs({ data }) {
  const [q, setQ] = useState('')
  const shown = filterDocs(data.docs, q)
  const groups = groupBy(shown, 'category')
  return (
    <>
      <input
        type="search"
        className="search"
        placeholder="Filter docs by keyword (e.g. upgrade 10.2)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter documentation links"
      />
      <p className="meta">{shown.length} of {data.docs.length} links</p>
      <div className="columns">
      {[...groups].map(([cat, items]) => (
        <div key={cat} className="group">
          <h3>{cat}</h3>
          <ul>
            {items.map((d) => (
              <li key={d.url}><a href={d.url} target="_blank" rel="noreferrer">{d.title}</a></li>
            ))}
          </ul>
        </div>
      ))}
      </div>
      <p className="meta">Source: {data.source}</p>
    </>
  )
}
