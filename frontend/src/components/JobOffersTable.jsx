import { memo, useCallback, useState, useEffect, useRef } from 'react'

const TABLE_COLUMNS = [
  { id: 'offer',       label: 'Offre',               cls: '' },
  { id: 'skills',      label: 'Compétences clés',    cls: '' },
  { id: 'experience',  label: 'Expérience',          cls: 'text-center' },
  { id: 'candidates',  label: 'Candidatures',        cls: 'text-center' },
  { id: 'published',   label: 'Publiée le',          cls: '' },
  { id: 'file',        label: 'Fichier',             cls: 'text-center' },
  { id: 'actions',     label: '',                    cls: '' },
]

const MENU_ITEMS = [
  { icon: 'open_in_new', label: "Voir l'offre" },
  { icon: 'edit',        label: 'Modifier' },
  { icon: 'delete',      label: 'Supprimer' },
]

const NAV_BTN_CLS = `p-3 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
  transition-colors duration-150 active:scale-[0.94]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`

const SkillTag = memo(function SkillTag({ skill }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap"
      style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
    >
      {skill}
    </span>
  )
})

const JobOfferRow = memo(function JobOfferRow({ offer }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])

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
        {offer.experienceYears != null ? (
          <span className="text-[13px] font-medium text-on-surface-variant tabular-nums">
            {offer.experienceYears} an{offer.experienceYears > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[13px] text-text-muted">—</span>
        )}
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
              {MENU_ITEMS.map(({ icon, label }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={closeMenu}
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

function SkeletonRow() {
  return (
    <tr className="border-b border-outline-variant/30 last:border-0">
      {TABLE_COLUMNS.map(({ id }) => (
        <td key={id} className="px-6 py-4">
          <div className="h-4 rounded-md bg-surface-container animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={TABLE_COLUMNS.length} className="px-6 py-16 text-center">
        <span className="material-symbols-outlined text-[40px] text-text-muted block mb-3">
          work_off
        </span>
        <p className="text-[14px] font-semibold text-on-surface">Aucune offre trouvée</p>
        <p className="text-[13px] text-text-muted mt-1">
          Ajustez vos filtres ou publiez une nouvelle offre.
        </p>
      </td>
    </tr>
  )
}

function buildPaginationLabel(visibleCount, totalCount) {
  if (visibleCount === 0) return 'Aucune offre à afficher'
  return `Affichage 1–${visibleCount} sur ${totalCount} offres`
}

export default function JobOffersTable({ offers = [], totalCount = 0, loading = false }) {
  const isEmpty = !loading && offers.length === 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-purple-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table
          className="w-full text-left border-collapse"
          aria-label="Liste des offres d'emploi"
        >
          <thead>
            <tr className="border-b border-outline-variant/50">
              {TABLE_COLUMNS.map(({ id, label, cls }) => (
                <th
                  key={id}
                  scope="col"
                  className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
              : isEmpty
                ? <EmptyState />
                : offers.map((offer) => <JobOfferRow key={offer.id} offer={offer} />)
            }
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3.5 border-t border-outline-variant/40">
        <p className="text-[12px] font-medium text-text-muted">
          {buildPaginationLabel(offers.length, totalCount)}
        </p>

        <div className="flex items-center gap-1.5">
          <button className={NAV_BTN_CLS} aria-label="Page précédente" disabled={isEmpty}>
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <button
            className="w-11 h-11 rounded-lg text-[13px] font-bold text-on-primary bg-primary
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </button>

          <button className={NAV_BTN_CLS} aria-label="Page suivante" disabled={isEmpty}>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
