export default function BackButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-primary
        transition-colors duration-150 mb-5 group"
    >
      <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform duration-150">
        arrow_back
      </span>
      {children}
    </button>
  )
}
