import { useEffect, useState } from 'react'
import Versions from './components/Versions.jsx'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/versions.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <main>
      <header>
        <h1>Splunk Tracker</h1>
        <p className="sub">Version lifecycle, docs, Splunkbase updates and handy tools.</p>
      </header>
      <section>
        <h2>Splunk Enterprise versions</h2>
        {error && <p className="err">Could not load version data ({error}).</p>}
        {!data && !error && <p>Loading…</p>}
        {data && <Versions data={data} />}
      </section>
    </main>
  )
}
