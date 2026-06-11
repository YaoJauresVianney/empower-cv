import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { CHART_PALETTE, AXIS_TICK, CURSOR_FILL, normalizeChartData } from './chartTheme'
import { ValueTooltip } from './ChartTooltip'
import ChartEmpty from './ChartEmpty'

export default function HorizontalBarChart({ data, labelWidth = 130 }) {
  const rows = normalizeChartData(data)
  if (!rows.length) return <ChartEmpty />

  return (
    <ResponsiveContainer width="100%" height={Math.max(rows.length * 30, 60)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category" dataKey="label" width={labelWidth}
          tick={AXIS_TICK} axisLine={false} tickLine={false}
        />
        <Tooltip content={<ValueTooltip />} cursor={CURSOR_FILL} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
          {rows.map((_, i) => (
            <Cell key={i} fill={CHART_PALETTE[Math.min(i, CHART_PALETTE.length - 1)]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
