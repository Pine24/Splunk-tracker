import test from 'node:test'
import assert from 'node:assert/strict'
import { filterDocs, groupBy } from './filter.js'

const docs = [
  { category: 'Release notes', title: 'Deprecated in 10.2' },
  { category: 'Install and upgrade', title: 'About upgrading to 10.2' },
]

test('empty query returns everything', () => assert.equal(filterDocs(docs, '  ').length, 2))
test('AND matching on title and category', () => {
  assert.equal(filterDocs(docs, 'upgrade 10.2').length, 1)
  assert.equal(filterDocs(docs, 'release deprecated').length, 1)
  assert.equal(filterDocs(docs, 'nomatch').length, 0)
})
test('groupBy keeps order', () => {
  assert.deepEqual([...groupBy(docs, 'category').keys()], ['Release notes', 'Install and upgrade'])
})
