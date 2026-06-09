export default function InfoRow({ label, children, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-outline-variant/30 last:border-0">
      <span className="text-[12px] text-text-muted font-medium whitespace-nowrap">{label}</span>
      {children ?? <span className="text-[13px] font-semibold text-on-surface truncate text-right">{value ?? '—'}</span>}
    </div>
  )
}
