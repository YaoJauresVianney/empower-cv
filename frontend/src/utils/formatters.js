export const formatExperienceYears = (years) => `${years} an${years > 1 ? 's' : ''}`

export const formatRetryAt = (date) => {
  const d = new Date(date)
  if (d.getSeconds() > 0 || d.getMilliseconds() > 0) {
    d.setMinutes(d.getMinutes() + 1, 0, 0)
  }
  const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(d)
  const time = `${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`
  return `le ${day} à ${time}`
}
