import { useState, useRef, useEffect, useMemo } from 'react'

/**
 * Searchable multi-select ("select2"-style) dropdown.
 *
 * @param {(string|{label:string,value:string})[]} options
 * @param {string[]} value            currently selected values
 * @param {(next: string[]) => void} onChange
 * @param {string} placeholder        shown when nothing is selected
 * @param {string} searchPlaceholder  placeholder of the inner search field
 */
export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Sélectionner…',
  searchPlaceholder = 'Rechercher…',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const searchRef = useRef(null)

  const normalized = useMemo(
    () => options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o)),
    [options],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return normalized
    return normalized.filter((o) => o.label.toLowerCase().includes(q))
  }, [normalized, query])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Focus search field when opening (DOM side-effect only)
  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  const toggle = (val) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val))
    else onChange([...value, val])
  }

  const clearAll = (e) => {
    e.stopPropagation()
    onChange([])
  }

  const count = value.length
  const triggerLabel = count === 0 ? placeholder : `${placeholder} · ${count}`

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 pr-2 text-[13px] font-semibold outline-none cursor-pointer transition-all duration-150 max-w-[200px]"
        style={{
          background: count ? 'rgba(79,0,103,0.08)' : '#f4f2f7',
          color: count ? '#4f0067' : '#4f4351',
          border: open ? '1px solid rgba(79,0,103,0.3)' : '1px solid transparent',
        }}
      >
        <span className="truncate">{triggerLabel}</span>
        {count > 0 ? (
          <span
            role="button"
            aria-label="Effacer la sélection"
            onClick={clearAll}
            className="material-symbols-outlined text-[16px] hover:opacity-70"
          >
            close
          </span>
        ) : (
          <span className="material-symbols-outlined text-[16px] text-text-muted" aria-hidden="true">
            expand_more
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-[240px] rounded-xl bg-white py-2"
          style={{ boxShadow: '0 6px 24px rgba(79,0,103,0.14)' }}
        >
          <div className="px-2 pb-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg px-3 py-1.5 text-[13px] outline-none"
              style={{ background: '#f4f2f7', color: '#4f4351' }}
            />
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[13px] text-text-muted">Aucun résultat</p>
            ) : (
              filtered.map((o) => {
                const selected = value.includes(o.value)
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[#f4f2f7]"
                    style={{ color: selected ? '#4f0067' : '#4f4351', fontWeight: selected ? 600 : 400 }}
                  >
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ color: selected ? '#4f0067' : 'rgba(79,67,81,0.4)' }}
                      aria-hidden="true"
                    >
                      {selected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    <span className="truncate">{o.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
