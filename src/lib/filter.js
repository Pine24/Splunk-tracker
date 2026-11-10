// Case-insensitive AND match: every whitespace-separated term must appear in the title or category.
export function filterDocs(docs, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return docs
  return docs.filter((d) => {
    const hay = `${d.title} ${d.category}`.toLowerCase()
    return terms.every((t) => hay.includes(t))
  })
}

export function groupBy(items, key) {
  const out = new Map()
  for (const it of items) {
    if (!out.has(it[key])) out.set(it[key], [])
    out.get(it[key]).push(it)
  }
  return out
}
