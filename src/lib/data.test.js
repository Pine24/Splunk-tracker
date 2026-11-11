import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const load = (f) => JSON.parse(readFileSync(new URL(`../../public/data/${f}`, import.meta.url), 'utf8'))

for (const file of ['docs.json', 'itsi-docs.json']) test(`${file}: complete entries, https URLs, no duplicates`, () => {
  const { docs } = load(file)
  const urls = new Set()
  for (const d of docs) {
    assert.ok(d.category && d.title && d.url, `incomplete entry: ${JSON.stringify(d)}`)
    assert.match(d.url, /^https:\/\//, `non-https URL: ${d.url}`)
    assert.ok(!urls.has(d.url), `duplicate URL: ${d.url}`)
    urls.add(d.url)
  }
  assert.ok(docs.length > 0)
})

test('links.json: complete entries, https URLs', () => {
  for (const g of load('links.json').groups) {
    assert.ok(g.name && g.links.length)
    for (const l of g.links) assert.ok(l.title && l.desc && /^https:\/\//.test(l.url), `bad link: ${JSON.stringify(l)}`)
  }
})
