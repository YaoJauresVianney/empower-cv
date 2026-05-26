export default function FilterBar({ children, onAdvancedFilters }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white rounded-xl px-4 py-3"
      style={{ boxShadow: '0 1px 6px rgba(79,0,103,0.05)' }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>

      <button
        onClick={onAdvancedFilters}
        className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg
          transition-all duration-150 active:scale-[0.97]"
        style={{ color: '#817282' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#4f0067'
          e.currentTarget.style.background = '#faf0ff'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#817282'
          e.currentTarget.style.background = ''
        }}
      >
        <span className="material-symbols-outlined text-[16px]">tune</span>
        Filtres avancés
      </button>
    </div>
  )
}
