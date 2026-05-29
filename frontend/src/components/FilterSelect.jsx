export default function FilterSelect({ options, value, onChange, label }) {
  const controlled = value !== undefined && onChange !== undefined
  const selectLabel = label ?? options[0]
  return (
    <div className="relative">
      <select
        aria-label={selectLabel}
        className="appearance-none rounded-lg px-3 py-1.5 pr-8 text-[13px] font-semibold outline-none cursor-pointer transition-all duration-150"
        style={{
          background: '#f4f2f7',
          color: '#4f4351',
          border: '1px solid transparent',
        }}
        {...(controlled ? { value, onChange: (e) => onChange(e.target.value) } : {})}
        onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(79,0,103,0.3)')}
        onBlur={(e) => (e.currentTarget.style.border = '1px solid transparent')}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span
        className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px] text-text-muted"
        aria-hidden="true"
      >
        expand_more
      </span>
    </div>
  )
}
