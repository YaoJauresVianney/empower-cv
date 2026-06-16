import { useEffect, useState } from 'react'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function TopBar({ user, onMenuToggle }) {
  const [scrolled, setScrolled] = useState(false)

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

  const initials = getInitials(user?.name)

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

        <div className="topbar-search relative w-full max-w-sm rounded-lg">
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none"
            aria-hidden="true"
          >
            search
          </span>
          <input
            aria-label="Rechercher des candidats, offres"
            className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2 text-base sm:text-[14px] text-on-surface outline-none placeholder:text-text-muted"
            placeholder="Rechercher des candidats, offres..."
            type="text"
          />
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
