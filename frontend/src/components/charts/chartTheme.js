export const CHART_PRIMARY = '#4f0067'

export const CHART_PALETTE = ['#4f0067', '#710193', '#9b34c5', '#c06ad6', '#d9a0e8', '#ede4ef']

export const AXIS_TICK = { fontSize: 12, fill: '#817282', fontFamily: 'Manrope, sans-serif' }

export const CURSOR_FILL = { fill: 'rgba(79,0,103,0.04)' }

export const formatNumberFr = (n) => n != null ? Number(n).toLocaleString('fr-FR') : '—'

// Les counts arrivent en string depuis les agrégats MySQL bruts.
export const normalizeChartData = (data) =>
  data?.map((d) => ({ ...d, count: Number(d.count) })) ?? []
