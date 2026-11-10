import { useJson } from '../hooks.js'

export default function Section({ title, file, children: render }) {
  const { data, error } = useJson(file)
  return (
    <section>
      <h2>{title}</h2>
      {error && <p className="err">Could not load {file} ({error}).</p>}
      {!data && !error && <p>Loading…</p>}
      {data && render(data)}
    </section>
  )
}
