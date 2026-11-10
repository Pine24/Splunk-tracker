// Color + status logic for end-of-support dates.
const DAY = 86400000

export function daysLeft(endDate, now = new Date()) {
  const end = new Date(endDate + 'T00:00:00Z')
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((end.getTime() - today) / DAY)
}

// Green (hue 130) far away -> amber -> red (hue 0) as the date approaches.
// windowDays = how far out the color starts shifting (default ~18 months).
export function eolColor(days, windowDays = 548) {
  if (days <= 0) return 'hsl(0 0% 35%)'
  const t = Math.min(Math.max(days / windowDays, 0), 1)
  const hue = Math.round(130 * Math.pow(t, 0.8))
  return `hsl(${hue} 70% 42%)`
}

export function eolLabel(days) {
  if (days <= 0) return 'End of support'
  if (days < 60) return `${days} days left`
  const months = Math.round(days / 30.4)
  return months < 24 ? `${months} months left` : `${(days / 365).toFixed(1)} years left`
}

// Fraction (0..1) of the support window already elapsed, for the timeline bar.
export function elapsedFraction(released, endDate, now = new Date()) {
  const start = new Date(released + 'T00:00:00Z').getTime()
  const end = new Date(endDate + 'T00:00:00Z').getTime()
  if (!(end > start)) return 1
  return Math.min(Math.max((now.getTime() - start) / (end - start), 0), 1)
}
