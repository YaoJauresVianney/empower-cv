import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

// Découpe `text` autour de `query` (insensible à la casse) et met le terme en évidence.
function highlight(text, query) {
  const value = text ?? ''
  if (!query) return value

  const lower = value.toLowerCase()
  const needle = query.toLowerCase()
  const parts = []
  let from = 0
  let at = lower.indexOf(needle)

  while (at !== -1) {
    if (at > from) parts.push({ text: value.slice(from, at), match: false })
    parts.push({ text: value.slice(at, at + needle.length), match: true })
    from = at + needle.length
    at = lower.indexOf(needle, from)
  }
  if (from < value.length) parts.push({ text: value.slice(from), match: false })

  return parts.map((part, i) =>
    part.match
      ? <mark key={i} className="bg-transparent text-primary font-semibold">{part.text}</mark>
      : <span key={i}>{part.text}</span>,
  )
}

// Aplatit candidats + offres en une seule liste navigable au clavier.
function flatten(results) {
  const candidates = (results?.candidates ?? []).map((c) => ({
    type: 'candidate',
    id: c.id,
    primary: c.name,
    secondary: c.role,
  }))
  const jobs = (results?.jobs ?? []).map((j) => ({
    type: 'job',
    id: j.id,
    primary: j.title,
    secondary: null,
  }))
  return { candidates, jobs, all: [...candidates, ...jobs] }
}

const GlobalSearchDropdown = forwardRef(function GlobalSearchDropdown(
  { query, loading, results, onSelect, inputRef, listboxId },
  ref,
) {
  const itemRefs = useRef([])
  const { candidates, jobs, all } = useMemo(() => flatten(results), [results])

  // Permet à la TopBar de déplacer le focus sur le 1er item (flèche bas depuis l'input).
  useImperativeHandle(ref, () => ({
    focusFirst() {
      itemRefs.current[0]?.focus()
    },
  }), [])

  const focusItem = (index) => {
    if (index < 0) {
      inputRef?.current?.focus()
      return
    }
    itemRefs.current[index]?.focus()
  }

  const handleItemKeyDown = (event, index, item) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusItem(Math.min(index + 1, all.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        focusItem(index - 1) // -1 => retour à l'input
        break
      case 'Enter':
        event.preventDefault()
        onSelect(item)
        break
      default:
        break
    }
  }

  const renderItem = (item, index) => (
    <li key={`${item.type}-${item.id}`} role="option" aria-selected="false">
      <button
        type="button"
        ref={(el) => { itemRefs.current[index] = el }}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => handleItemKeyDown(e, index, item)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
          hover:bg-surface-container focus:bg-surface-container focus:outline-none transition-colors"
      >
        <span
          className="material-symbols-outlined text-[18px] text-text-muted shrink-0"
          aria-hidden="true"
        >
          {item.type === 'candidate' ? 'person' : 'work'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] text-on-surface">
            {highlight(item.primary, query)}
          </span>
          {item.secondary && (
            <span className="block truncate text-[12px] text-text-muted">
              {highlight(item.secondary, query)}
            </span>
          )}
        </span>
      </button>
    </li>
  )

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-xl bg-surface shadow-lg
        border border-outline-variant/40 overflow-hidden"
      style={{ boxShadow: '0 8px 24px rgba(79,0,103,0.12)' }}
    >
      {loading && (
        <div className="flex items-center gap-2 px-3 py-3 text-[13px] text-text-muted">
          <span className="material-symbols-outlined text-[18px] animate-spin" aria-hidden="true">
            progress_activity
          </span>
          Recherche en cours…
        </div>
      )}

      {!loading && all.length === 0 && (
        <div className="px-3 py-3 text-[13px] text-text-muted">
          Aucun résultat pour « {query} »
        </div>
      )}

      {!loading && all.length > 0 && (
        <ul role="listbox" id={listboxId} className="max-h-[70vh] overflow-y-auto p-1.5">
          {candidates.length > 0 && (
            <li role="presentation">
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Candidats
              </p>
              <ul role="presentation">
                {candidates.map((item, i) => renderItem(item, i))}
              </ul>
            </li>
          )}
          {jobs.length > 0 && (
            <li role="presentation">
              <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Offres
              </p>
              <ul role="presentation">
                {jobs.map((item, i) => renderItem(item, candidates.length + i))}
              </ul>
            </li>
          )}
        </ul>
      )}
    </div>
  )
})

export default GlobalSearchDropdown
