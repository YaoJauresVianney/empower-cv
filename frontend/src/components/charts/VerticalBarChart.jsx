import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { CHART_PRIMARY, AXIS_TICK, CURSOR_FILL, normalizeChartData } from './chartTheme'
import { ValueTooltip } from './ChartTooltip'
import ChartEmpty from './ChartEmpty'

const SMALL_TICK = { ...AXIS_TICK, fontSize: 11 }

export default function VerticalBarChart({ data, color = CHART_PRIMARY, height = 180 }) {
  const rows = normalizeChartData(data)
  if (!rows.length) return <ChartEmpty />

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={SMALL_TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={SMALL_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ValueTooltip />} cursor={CURSOR_FILL} />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
