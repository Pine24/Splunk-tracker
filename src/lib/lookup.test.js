import test from 'node:test'
import assert from 'node:assert/strict'
import { lookupVersion } from './lookup.js'

const versions = [
  { version: '10.2', endOfSupport: '2028-01-15' },
  { version: '10.3', endOfSupport: null },
]
const now = new Date('2027-01-15T10:00:00Z')

test('patch release inherits the x.y end of support', () => {
  const r = lookupVersion('10.2.4', versions, now)
  assert.equal(r.status, 'ok')
  assert.equal(r.minor, '10.2')
  assert.equal(r.days, 365)
})
test('accepts x.y, v-prefix and four-part versions', () => {
  for (const s of ['10.2', 'v10.2.1', '10.2.0.5']) assert.equal(lookupVersion(s, versions, now).minor, '10.2')
})
test('cloud-only, unknown, invalid and empty', () => {
  assert.equal(lookupVersion('10.3.1', versions, now).status, 'cloud-only')
  assert.equal(lookupVersion('9.4.12', versions, now).status, 'unknown')
  assert.equal(lookupVersion('banana', versions, now).status, 'invalid')
  assert.equal(lookupVersion('  ', versions, now).status, 'empty')
})
