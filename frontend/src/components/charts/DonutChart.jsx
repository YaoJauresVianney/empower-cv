import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts'
import { CHART_PRIMARY, CHART_PALETTE, formatNumberFr, normalizeChartData } from './chartTheme'
import { NameValueTooltip } from './ChartTooltip'
import ChartEmpty from './ChartEmpty'

function DonutLegend({ rows, maxItems }) {
  return (
    <div className="mt-3 space-y-1.5">
      {rows.slice(0, maxItems).map((item, i) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
          />
          <span className="text-[12px] text-[#4f4351] truncate flex-1">{item.label}</span>
          <span
            className="text-[12px] font-semibold tabular-nums"
            style={{ color: CHART_PRIMARY }}
          >
            {formatNumberFr(item.count)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DonutChart({ data, unit = '', legend = true, maxLegendItems = 6 }) {
  const rows = normalizeChartData(data)
  if (!rows.length) return <ChartEmpty />

  return (
    <>
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie
            data={rows} cx="50%" cy="50%"
            innerRadius={52} outerRadius={78}
            dataKey="count" nameKey="label" paddingAngle={2}
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<NameValueTooltip unit={unit} />} />
        </PieChart>
      </ResponsiveContainer>
      {legend && <DonutLegend rows={rows} maxItems={maxLegendItems} />}
    </>
  )
}
