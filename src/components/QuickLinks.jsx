export default function QuickLinks({ data }) {
  return (
    <div className="columns">
      {data.groups.map((g) => (
        <div key={g.name} className="group">
          <h3>{g.name}</h3>
          <div className="cards tools">
            {g.links.map((l) => (
              <a key={l.url} className="link" href={l.url} target="_blank" rel="noreferrer">
                <strong>{l.title}</strong>
                <span>{l.desc}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
