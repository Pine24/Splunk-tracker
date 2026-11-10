import { useJson } from '../hooks.js'

export default function Section({ id, className = '', title, file, children: render }) {
  const { data, error } = useJson(file)
  return (
    <section id={id} className={`panel ${className}`}>
      <h2>{title}</h2>
      {error && <p className="err">Could not load {file} ({error}).</p>}
      {!data && !error && <p className="meta">Loading…</p>}
      {data && render(data)}
    </section>
  )
}
