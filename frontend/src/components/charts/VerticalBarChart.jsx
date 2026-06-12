import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { CHART_PRIMARY, AXIS_TICK, CURSOR_FILL, normalizeChartData } from './chartTheme'
import { ValueTooltip } from './ChartTooltip'
import ChartEmpty from './ChartEmpty'

const SMALL_TICK = { ...AXIS_TICK, fontSize: 11 }

export default function VerticalBarChart({ data, color = CHART_PRIMARY, height = 180, ariaLabel = 'Graphique en barres verticales' }) {
  const rows = normalizeChartData(data)
  if (!rows.length) return <ChartEmpty />

  const manyCategories = rows.length > 6
  const xAxisTick = manyCategories
    ? { ...SMALL_TICK, angle: -35, textAnchor: 'end' }
    : SMALL_TICK
  const bottomMargin = manyCategories ? 40 : 0

  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height + bottomMargin}>
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: bottomMargin }}>
          <XAxis dataKey="label" tick={xAxisTick} axisLine={false} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={SMALL_TICK} axisLine={false} tickLine={false} />
          <Tooltip content={<ValueTooltip />} cursor={CURSOR_FILL} />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
