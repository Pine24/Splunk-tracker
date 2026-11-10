import test from 'node:test'
import assert from 'node:assert/strict'
import { daysLeft, eolColor, eolLabel } from './eol.js'

test('daysLeft counts whole days', () => {
  assert.equal(daysLeft('2026-12-16', new Date('2026-11-16T10:00:00Z')), 30)
  assert.equal(daysLeft('2026-11-10', new Date('2026-11-10T23:59:00Z')), 0)
})

test('color shifts from green toward red as date nears', () => {
  const hue = (c) => Number(c.match(/hsl\((\d+)/)[1])
  assert.ok(hue(eolColor(700)) > hue(eolColor(300)))
  assert.ok(hue(eolColor(300)) > hue(eolColor(30)))
  assert.equal(eolColor(-5), 'hsl(0 0% 35%)')
})

test('labels', () => {
  assert.equal(eolLabel(0), 'End of support')
  assert.equal(eolLabel(30), '30 days left')
  assert.match(eolLabel(200), /months left/)
})
