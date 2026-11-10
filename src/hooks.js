import { useEffect, useState } from 'react'

export function useJson(name) {
  const [state, setState] = useState({ data: null, error: null })
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/${name}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then((data) => setState({ data, error: null }))
      .catch((e) => setState({ data: null, error: String(e) }))
  }, [name])
  return state
}
