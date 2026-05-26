export function formatTimeAgo(date: Date) {
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000))
  const units = [
    { label: 'year', seconds: 31_536_000 },
    { label: 'month', seconds: 2_592_000 },
    { label: 'day', seconds: 86_400 },
    { label: 'hour', seconds: 3_600 },
    { label: 'minute', seconds: 60 }
  ]

  const unit = units.find(item => seconds >= item.seconds)
  if (!unit) return 'less than a minute ago'

  const value = Math.floor(seconds / unit.seconds)
  return `${value} ${unit.label}${value === 1 ? '' : 's'} ago`
}
