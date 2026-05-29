import { useEffect, useState } from 'react'

const TAB_LABELS = ['Toutes les candidatures', 'Récentes', 'Présélectionnées']

export default function TopBar({ user, onMenuToggle }) {
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

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

  const FALLBACK_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44'%3E%3Crect width='44' height='44' rx='8' fill='%23e8def8'/%3E%3Ccircle cx='22' cy='18' r='7' fill='%234f0067'/%3E%3Cellipse cx='22' cy='34' rx='11' ry='7' fill='%234f0067'/%3E%3C/svg%3E`
  const avatarSrc = user?.avatar ?? FALLBACK_AVATAR
  const avatarAlt = user?.name ?? 'Responsable RH'

  return (
    <header
      className={`sticky top-0 z-40 bg-background transition-colors duration-200${scrolled ? ' glass-topbar' : ''}`}
      style={{ borderBottom: '1px solid color-mix(in srgb, var(--color-outline-variant) 50%, transparent)' }}
    >
      {/* Main row */}
      <div className="flex justify-between items-center w-full px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
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

          <nav className="hidden lg:flex items-center gap-6" aria-label="Navigation principale">
            {TAB_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(i)}
                aria-current={activeTab === i ? 'page' : undefined}
                className="topbar-tab h-16 flex items-center text-[13px] font-semibold whitespace-nowrap"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            className="topbar-icon-btn relative p-3 rounded-full text-outline active:scale-[0.94]"
            aria-label="Notifications — nouvelles notifications disponibles"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">notifications</span>
            <span
              className="absolute top-3 right-3 w-2 h-2 rounded-full border-2 bg-error"
              style={{ borderColor: 'var(--color-background)' }}
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            className="topbar-cta hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[13px] text-on-primary active:scale-[0.97] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">person_add</span>
            Ajouter un candidat
          </button>

          <button
            type="button"
            className="topbar-avatar w-11 h-11 rounded-lg overflow-hidden border-2 active:scale-[0.94] shrink-0"
            aria-label={`Profil de ${avatarAlt}`}
          >
            <img
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              src={avatarSrc}
              width={44}
              height={44}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_AVATAR }}
            />
          </button>
        </div>
      </div>

      {/* Mobile tab bar — scrollable, no visible scrollbar */}
      <nav
        className="topbar-tabs-mobile lg:hidden overflow-x-auto"
        aria-label="Navigation principale"
        style={{ borderTop: '1px solid color-mix(in srgb, var(--color-outline-variant) 30%, transparent)' }}
      >
        <div className="flex px-4">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(i)}
              aria-current={activeTab === i ? 'page' : undefined}
              className="topbar-tab h-11 flex shrink-0 items-center text-[13px] font-semibold whitespace-nowrap px-3"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}
