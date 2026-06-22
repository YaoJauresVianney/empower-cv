import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { globalSearch } from '../services/api'
import GlobalSearchDropdown from './GlobalSearchDropdown'

const LISTBOX_ID = 'global-search-listbox'
const MIN_QUERY_LENGTH = 2

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TopBar({ user, onMenuToggle }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 0)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Debounce de la saisie avant l'appel réseau.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400)
    return () => clearTimeout(timer)
  }, [query])

  // Ferme le dropdown au clic en dehors du conteneur de recherche.
  useEffect(() => {
    const onMouseDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH

  const { data: results, isFetching } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: ({ signal }) => globalSearch(debouncedQuery, signal).then((res) => res.data?.data ?? null),
    enabled,
  })

  const initials = getInitials(user?.name)
  const showDropdown = isOpen && enabled

  const handleSelect = (item) => {
    setIsOpen(false)
    setQuery('')
    setDebouncedQuery('')
    navigate(item.type === 'candidate' ? `/candidates/${item.id}` : `/jobs/${item.id}`)
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }
    if (event.key === 'ArrowDown' && showDropdown) {
      event.preventDefault()
      dropdownRef.current?.focusFirst()
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-background transition-colors duration-200${scrolled ? ' glass-topbar' : ''}`}
      style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 50%, transparent)' }}
    >
      <div className="flex items-center w-full px-4 sm:px-6 h-16 gap-3 sm:gap-6">
        <button
          type="button"
          className="topbar-icon-btn lg:hidden p-3 rounded-lg text-outline active:scale-[0.94]"
          onClick={onMenuToggle}
          aria-label="Ouvrir le menu"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">menu</span>
        </button>

        <div ref={containerRef} className="relative w-full max-w-sm">
          <div className="topbar-search relative w-full rounded-lg">
            <span
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none"
              aria-hidden="true"
            >
              search
            </span>
            <input
              ref={inputRef}
              aria-label="Rechercher des candidats, offres"
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2 text-base sm:text-[14px] text-on-surface outline-none placeholder:text-text-muted"
              placeholder="Rechercher des candidats, offres..."
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setIsOpen(true) }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleInputKeyDown}
            />
          </div>

          {showDropdown && (
            <GlobalSearchDropdown
              ref={dropdownRef}
              query={debouncedQuery}
              loading={isFetching}
              results={results}
              onSelect={handleSelect}
              inputRef={inputRef}
              listboxId={LISTBOX_ID}
            />
          )}
        </div>

        <div
          className="ml-auto shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold select-none"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          aria-label={user?.name ? `Connecté en tant que ${user.name}` : 'Utilisateur connecté'}
          title={user?.name ?? ''}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
