import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Tableau de bord', to: '/dashboard' },
  { icon: 'group',     label: 'Candidats',       to: '/candidates' },
  { icon: 'work',      label: 'Offres',           to: '/jobs' },
  { icon: 'calendar_month', label: 'Entretiens', to: '/interviews' },
  { icon: 'analytics', label: 'Analyses',         to: '/analytics' },
]

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Sidebar({ onLogout, open, onClose }) {
  const bottomActions = [
    { icon: 'settings', label: 'Paramètres' },
    { icon: 'help',     label: 'Support' },
    { icon: 'logout',   label: 'Se déconnecter', action: onLogout },
  ]

  const asideRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) { previousFocusRef.current?.focus(); return }
    previousFocusRef.current = document.activeElement
    const focusableEls = () => Array.from(asideRef.current?.querySelectorAll(FOCUSABLE) ?? [])
    focusableEls()[0]?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const els = focusableEls()
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={asideRef}
        aria-label="Navigation principale"
        aria-modal={open ? 'true' : undefined}
        className={`sidebar-grain bg-primary-dark fixed left-0 top-0 bottom-0 flex flex-col p-4 z-50 w-64 h-screen overflow-y-auto
          transition-transform duration-300 ease-in-out motion-reduce:transition-none
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="mb-8 px-3 pt-2 flex items-center justify-between">
          <div className="bg-white rounded-md px-2 py-1">
            <img src={logo} alt="Empower" className="h-6 w-auto" />
          </div>
          <button
            className="lg:hidden p-3 rounded-lg text-nav-icon hover:text-primary-fixed-dim hover:bg-white/5
              transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Nav principale */}
        <nav aria-label="Menu principal" className="flex-grow space-y-0.5">
          {NAV_ITEMS.map(({ icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-3.5 pl-[10px] text-[13px] font-semibold border-l-2
                 transition-colors duration-150 active:scale-[0.97] min-w-0
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
                 ${isActive
                   ? 'bg-primary-fixed-dim/10 text-primary-fixed-dim border-transparent'
                   : 'text-text-muted border-transparent hover:bg-white/5 hover:text-primary-fixed-dim'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`material-symbols-outlined text-[20px] flex-shrink-0 ${isActive ? 'text-primary-fixed-dim' : 'text-nav-icon'}`}
                  >
                    {icon}
                  </span>
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Actions bas de sidebar */}
        <div
          className="mt-auto space-y-1 pt-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            className="w-full mb-4 font-bold py-2.5 px-4 rounded-xl text-[13px] text-on-primary
              flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]
              shadow-[0_4px_18px_rgba(79,0,103,0.45)] hover:shadow-[0_6px_28px_rgba(79,0,103,0.65)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
              focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark"
            style={{ background: 'linear-gradient(160deg, var(--color-primary-container), var(--color-primary))' }}
          >
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">add</span>
            <span className="truncate">Publier une offre</span>
          </button>

          {bottomActions.map(({ icon, label, action }) => {
            const cls = `flex items-center gap-3 rounded-lg py-3.5 pl-[10px] text-[13px] font-medium
              border-l-2 border-transparent text-nav-icon hover:bg-white/5 hover:text-nav-hover
              transition-colors duration-150 min-w-0 w-full
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim`

            return action ? (
              <button key={label} onClick={action} className={cls}>
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>
                <span className="truncate">{label}</span>
              </button>
            ) : (
              <a key={label} href="#" className={cls}>
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">{icon}</span>
                <span className="truncate">{label}</span>
              </a>
            )
          })}
        </div>
      </aside>
    </>
  )
}
