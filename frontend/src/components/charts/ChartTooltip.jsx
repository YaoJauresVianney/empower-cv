import { CHART_PRIMARY, formatNumberFr } from './chartTheme'

export function ValueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="bg-white border border-surface-purple rounded-lg px-3 py-2 shadow-purple-sm text-[12px] font-semibold"
      style={{ color: CHART_PRIMARY }}
    >
      {formatNumberFr(payload[0].value)}
    </div>
  )
}

export function NameValueTooltip({ active, payload, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-purple rounded-lg px-3 py-2 shadow-purple-sm text-[12px]">
      <p className="font-semibold text-on-surface">{payload[0].name}</p>
      <p style={{ color: CHART_PRIMARY }}>
        {formatNumberFr(payload[0].value)}{unit && ` ${unit}`}
      </p>
    </div>
  )
}
