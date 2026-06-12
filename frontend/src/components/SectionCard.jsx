export default function SectionCard({ title, icon, children, headerAction, shadow = 'shadow-purple-sm' }) {
  return (
    <div className={`animate-in bg-white rounded-2xl p-5 ${shadow}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px] text-primary">{icon}</span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">{title}</h2>
        {headerAction && <div className="ml-auto">{headerAction}</div>}
      </div>
      {children}
    </div>
  )
}
