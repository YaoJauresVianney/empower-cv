export default function PrimaryButton({ icon, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 font-bold py-2.5 px-4 rounded-xl text-[13px] text-on-primary
        transition-all duration-200 active:scale-[0.97]
        shadow-[0_4px_18px_rgba(79,0,103,0.45)] hover:shadow-[0_6px_28px_rgba(79,0,103,0.65)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim ${className}`}
      style={{ background: 'linear-gradient(160deg, var(--color-primary-container), var(--color-primary))' }}
    >
      {icon && <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
