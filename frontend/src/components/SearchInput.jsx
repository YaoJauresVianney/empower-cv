export default function SearchInput({ placeholder = 'Rechercher…', value, onChange }) {
  return (
    <div className="relative">
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-text-muted pointer-events-none"
        aria-hidden="true"
      >
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-3 py-1.5 rounded-lg text-[13px] font-medium text-on-surface border border-outline-variant/60
          focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim bg-transparent placeholder:text-text-muted w-52"
      />
    </div>
  )
}
