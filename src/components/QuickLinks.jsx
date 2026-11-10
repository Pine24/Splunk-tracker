export default function QuickLinks({ data }) {
  return data.groups.map((g) => (
    <div key={g.name}>
      <h3>{g.name}</h3>
      <div className="cards">
        {g.links.map((l) => (
          <a key={l.url} className="card link" href={l.url} target="_blank" rel="noreferrer">
            <strong>{l.title}</strong>
            <span>{l.desc}</span>
          </a>
        ))}
      </div>
    </div>
  ))
}
