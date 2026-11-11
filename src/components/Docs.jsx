import { useState } from 'react'
import { filterDocs, groupBy } from '../lib/filter.js'

function Note({ text }) {
  return (
    <p className="note">
      {text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </p>
  )
}

function GroupList({ items }) {
  return (
    <ul className="scroll">
      {items.map((d) => (
        <li key={d.url}><a href={d.url} target="_blank" rel="noreferrer" title={d.title}>{d.title}</a></li>
      ))}
    </ul>
  )
}

export default function Docs({ data, placeholder = 'Filter docs by keyword (e.g. upgrade 10.2)' }) {
  const [q, setQ] = useState('')
  const shown = filterDocs(data.docs, q)
  const groups = groupBy(shown, 'category')
  return (
    <>
      <input
        type="search"
        className="search"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Filter documentation links"
      />
      <p className="meta">{shown.length} of {data.docs.length} links</p>
      <div className="columns">
      {[...groups].map(([cat, items]) => (
        <div key={cat} className="group">
          <h3>{cat}</h3>
          {data.notes?.[cat] && <Note text={data.notes[cat]} />}
          <GroupList items={items} />
        </div>
      ))}
      </div>
      <p className="meta">Source: {data.source}</p>
    </>
  )
}
