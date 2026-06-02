export default function ActivityItem({ icon, label, date }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-outline-variant/30 last:border-0">
      <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: '#4f0067' }}>{icon}</span>
      <div>
        <p className="text-[13px] font-medium text-on-surface">{label}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{date ?? '—'}</p>
      </div>
    </div>
  )
}
