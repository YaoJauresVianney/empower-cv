import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SkillTag from './SkillTag'

const JobOfferRow = memo(function JobOfferRow({ offer }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])

  const menuItems = [
    { icon: 'open_in_new', label: "Voir l'offre", onClick: () => { closeMenu(); navigate(`/jobs/${offer.id}`) } },
    { icon: 'edit',        label: 'Modifier',      onClick: closeMenu },
    { icon: 'delete',      label: 'Supprimer',     onClick: closeMenu },
  ]

  useEffect(() => {
    if (!menuOpen) return
    const handleOutsideClick = (e) => {
      if (!menuRef.current?.contains(e.target)) closeMenu()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen, closeMenu])

  const visibleSkills = (offer.skills ?? []).slice(0, 3)
  const remainingSkills = Math.max(0, (offer.skills ?? []).length - 3)

  return (
    <tr className="group transition-colors duration-150 hover:bg-primary-fixed/40">
      <td className="px-6 py-4 max-w-64">
        <p className="text-[14px] font-semibold text-on-surface leading-snug truncate">
          {offer.title}
        </p>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
          {remainingSkills > 0 && (
            <span className="text-[11px] font-medium text-text-muted self-center">
              +{remainingSkills}
            </span>
          )}
          {visibleSkills.length === 0 && (
            <span className="text-[13px] text-text-muted">—</span>
          )}
        </div>
      </td>

<td className="px-6 py-4 text-center">
        <span
          className="text-[14px] font-bold tabular-nums"
          style={{ color: 'var(--color-primary)' }}
        >
          {offer.candidates ?? 0}
        </span>
      </td>

      <td className="px-6 py-4 text-[13px] text-outline tabular-nums whitespace-nowrap">
        {offer.publishedAt ?? '—'}
      </td>

      <td className="px-6 py-4 text-center">
        {offer.fileUrl ? (
          <a
            href={offer.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir le fichier : ${offer.title}`}
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-outline
              hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
          >
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          </a>
        ) : (
          <span className="text-[13px] text-text-muted">—</span>
        )}
      </td>

      <td className="px-6 py-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={toggleMenu}
            className={`p-1.5 rounded-lg text-outline hover:bg-primary-fixed/60 hover:text-primary active:scale-[0.95]
              transition-all duration-150
              focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
              ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            aria-label={`Plus d'options pour ${offer.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-8 z-50 bg-white rounded-xl py-1 min-w-[168px]"
              style={{
                boxShadow: '0 4px 20px rgba(79,0,103,0.14)',
                border: '1px solid rgba(79,0,103,0.08)',
              }}
            >
              {menuItems.map(({ icon, label, onClick }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={onClick}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-on-surface
                    hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-100"
                >
                  <span className="material-symbols-outlined text-[16px] text-outline">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
})

export default JobOfferRow
