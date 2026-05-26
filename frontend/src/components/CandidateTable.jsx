import { memo, useState, useEffect, useRef } from 'react'
import ProgressBar from './ProgressBar'

const handleAvatarError = (e) => { e.currentTarget.style.display = 'none' }

const STATUS_CONFIG = {
  'Présélectionné': {
    dot:  'var(--color-primary-container)',
    bg:   'var(--color-primary-fixed)',
    text: 'var(--color-primary)',
  },
  'En entretien': {
    dot:  'var(--color-status-info-dot)',
    bg:   'var(--color-status-info-bg)',
    text: 'var(--color-status-info-text)',
  },
  'Nouveau': {
    dot:  'var(--color-status-neutral-dot)',
    bg:   'var(--color-status-neutral-bg)',
    text: 'var(--color-status-neutral-text)',
  },
  'Refusé': {
    dot:  'var(--color-error)',
    bg:   'var(--color-error-container)',
    text: 'var(--color-on-error-container)',
  },
}

const TABLE_COLUMNS = [
  { label: 'Candidat',               cls: '' },
  { label: 'Rôle',                   cls: '' },
  { label: 'Statut',                 cls: '' },
  { label: 'Score de correspondance', cls: 'text-center' },
  { label: 'Candidature',            cls: '' },
  { label: '',                       cls: '' },
]

const StatusBadge = memo(function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['Nouveau']
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  )
})

const ScoreBar = memo(function ScoreBar({ score }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[14px] leading-5 font-bold text-primary tabular-nums">
        {score != null ? `${score}%` : '—'}
      </span>
      <ProgressBar value={score ?? 0} className="w-24" />
    </div>
  )
})

const MENU_ITEMS = [
  { icon: 'person',  label: 'Voir profil' },
  { icon: 'article', label: 'Voir CV' },
]

const CandidateRow = memo(function CandidateRow({ candidate }) {
  const name = candidate.name ?? 'Nom inconnu'
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <tr className="group transition-colors duration-150 hover:bg-primary-fixed/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-outline-variant/60 flex-shrink-0">
            <img
              alt={name}
              src={candidate.avatar}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              loading="lazy"
              onError={handleAvatarError}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-on-surface leading-snug truncate">{name}</p>
            <p className="text-[12px] text-outline mt-0.5 truncate">{candidate.email ?? ''}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[14px] font-medium text-on-surface-variant max-w-40">
        <span className="truncate block">{candidate.role ?? '—'}</span>
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={candidate.status} />
      </td>
      <td className="px-6 py-4">
        <ScoreBar score={candidate.score} />
      </td>
      <td className="px-6 py-4 text-[13px] text-outline tabular-nums whitespace-nowrap">
        {candidate.date ?? '—'}
      </td>
      <td className="px-6 py-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={`p-1.5 rounded-lg text-outline hover:bg-primary-fixed/60 hover:text-primary active:scale-[0.95]
              transition-all duration-150
              focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
              ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            aria-label={`Plus d'options pour ${name}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-8 z-50 bg-white rounded-xl py-1 min-w-[152px]"
              style={{ boxShadow: '0 4px 20px rgba(79,0,103,0.14)', border: '1px solid rgba(79,0,103,0.08)' }}
            >
              {MENU_ITEMS.map(({ icon, label }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
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

function EmptyState() {
  return (
    <tr>
      <td colSpan={TABLE_COLUMNS.length} className="px-6 py-16 text-center">
        <span className="material-symbols-outlined text-[40px] text-text-muted block mb-3">person_search</span>
        <p className="text-[14px] font-semibold text-on-surface">Aucun candidat trouvé</p>
        <p className="text-[13px] text-text-muted mt-1">Ajustez vos filtres ou ajoutez des candidats.</p>
      </td>
    </tr>
  )
}

export default function CandidateTable({ candidates = [] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-purple-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table
          className="w-full text-left border-collapse"
          aria-label="Liste des candidats"
        >
          <thead>
            <tr className="border-b border-outline-variant/50">
              {TABLE_COLUMNS.map(({ label, cls }) => (
                <th
                  key={label}
                  scope="col"
                  className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0
              ? <EmptyState />
              : candidates.map((c) => <CandidateRow key={c.id} candidate={c} />)
            }
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3.5 border-t border-outline-variant/40">
        <p className="text-[12px] font-medium text-text-muted">
          Affichage 1–{candidates.length} sur 1 284 candidats
        </p>
        <div className="flex items-center gap-1.5">
          <button
            className="p-2.5 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
              transition-colors duration-150 active:scale-[0.94]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
            aria-label="Page précédente"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <button
            className="w-10 h-10 rounded-lg text-[13px] font-bold text-on-primary bg-primary transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </button>

          {['2', '3'].map((n) => (
            <button
              key={n}
              className="w-10 h-10 rounded-lg text-[13px] font-semibold text-outline hover:bg-primary-fixed
                transition-colors duration-150 active:scale-[0.94]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
              aria-label={`Page ${n}`}
            >
              {n}
            </button>
          ))}

          <button
            className="p-2.5 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
              transition-colors duration-150 active:scale-[0.94]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
            aria-label="Page suivante"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
