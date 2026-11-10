// Resolve any Splunk version string (10.2, 10.2.4, 10.6.0.5) to its x.y support entry.
// Patch releases inherit the end-of-support date of their x.y version.
import { daysLeft } from './eol.js'

const PATTERN = /^v?(\d{1,2})\.(\d{1,2})(?:\.\d+){0,2}$/

export function lookupVersion(input, versions, now = new Date()) {
  const text = input.trim()
  if (!text) return { status: 'empty' }
  const m = PATTERN.exec(text)
  if (!m) return { status: 'invalid' }
  const minor = `${m[1]}.${m[2]}`
  const entry = versions.find((v) => v.version === minor)
  if (!entry) return { status: 'unknown', minor }
  if (!entry.endOfSupport) return { status: 'cloud-only', minor, entry }
  return { status: 'ok', minor, entry, days: daysLeft(entry.endOfSupport, now) }
}
