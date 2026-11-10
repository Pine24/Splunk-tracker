import { useState } from 'react'
import { filterDocs, groupBy } from '../lib/filter.js'

function Note({ text }) {
  return (
    <p className="note">
      {text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </p>
  )
}

const VISIBLE = 10

function GroupList({ items }) {
  const [gq, setGq] = useState('')
  const terms = gq.toLowerCase().split(/\s+/).filter(Boolean)
  const list = terms.length ? items.filter((d) => terms.every((t) => d.title.toLowerCase().includes(t))) : items
  return (
    <>
      {items.length > VISIBLE && (
        <input
          type="search"
          className="search mini"
          placeholder={`Search ${items.length} links…`}
          value={gq}
          onChange={(e) => setGq(e.target.value)}
          aria-label="Filter this category"
        />
      )}
      <ul className="scroll">
        {list.map((d) => (
          <li key={d.url}><a href={d.url} target="_blank" rel="noreferrer" title={d.title}>{d.title}</a></li>
        ))}
        {!list.length && <li className="empty">No matches</li>}
      </ul>
    </>
  )
}

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
          {data.notes?.[cat] && <Note text={data.notes[cat]} />}
          <GroupList items={items} />
        </div>
      ))}
      </div>
      <p className="meta">Source: {data.source}</p>
    </>
  )
}
