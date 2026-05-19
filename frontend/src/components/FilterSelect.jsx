export default function FilterSelect({ options }) {
  return (
    <div className="relative">
      <select
        className="appearance-none rounded-lg px-3 py-1.5 pr-8 text-[13px] font-semibold outline-none cursor-pointer transition-all duration-150"
        style={{
          background: '#f4f2f7',
          color: '#4f4351',
          border: '1px solid transparent',
        }}
        onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(79,0,103,0.3)')}
        onBlur={(e) => (e.currentTarget.style.border = '1px solid transparent')}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <span
        className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[16px]"
        style={{ color: '#9c8fa0' }}
      >
        expand_more
      </span>
    </div>
  )
}
