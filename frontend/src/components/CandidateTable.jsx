import { memo, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseCandidateCv } from '../services/api'
import CandidateAvatar from './CandidateAvatar'

const TABLE_COLUMNS = [
  { label: 'Candidat', cls: '' },
  { label: 'Rôle',     cls: '' },
  { label: 'Statut',   cls: '' },
  { label: 'CV',       cls: '' },
  { label: '',         cls: '' },
]

const CandidateRow = memo(function CandidateRow({ candidate }) {
  const navigate = useNavigate()
  const name = candidate.name ?? 'Nom inconnu'
  const [menuOpen, setMenuOpen]     = useState(false)
  const [parseState, setParseState] = useState('idle') // idle | loading | success | error
  const [menuPos, setMenuPos]       = useState(null)
  const btnRef   = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleToggle = useCallback(() => {
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const openUpward = window.innerHeight - rect.bottom < 160
      setMenuPos(openUpward
        ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
        : { top: rect.bottom + 4,                      right: window.innerWidth - rect.right }
      )
    }
    setMenuOpen(v => !v)
  }, [menuOpen])

  const handleParseCv = useCallback(() => {
    if (parseState === 'loading') return
    setParseState('loading')
    setMenuOpen(false)
    parseCandidateCv(candidate.id)
      .then(() => setParseState('success'))
      .catch(() => setParseState('error'))
      .finally(() => {
        timerRef.current = setTimeout(() => setParseState('idle'), 3000)
      })
  }, [candidate.id, parseState])

  return (
    <tr className="group transition-colors duration-150 hover:bg-primary-fixed/40">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <CandidateAvatar name={name} avatar={candidate.avatar} size="sm" />
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
        {candidate.is_parsed
          ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              Analysé
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-variant text-outline">
              <span className="material-symbols-outlined text-[13px]">hourglass_empty</span>
              Non analysé
            </span>
          )
        }
      </td>
      <td className="px-6 py-4">
        {candidate.cv_link
          ? (
            <a
              href={candidate.cv_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-semibold text-primary hover:bg-primary-fixed transition-colors duration-150"
              aria-label="Voir le CV"
            >
              <span className="material-symbols-outlined text-[15px]">description</span>
              CV
            </a>
          )
          : <span className="text-[13px] text-outline">—</span>
        }
      </td>
      <td className="px-6 py-4">
        <div className="relative">
          {menuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          )}
          <button
            ref={btnRef}
            onClick={handleToggle}
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

          {parseState !== 'idle' && (
            <span className={`absolute right-8 top-1.5 text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md ${
              parseState === 'loading' ? 'text-outline bg-primary-fixed' :
              parseState === 'success' ? 'text-primary bg-primary-fixed' :
              'text-error bg-error-container'
            }`}>
              {parseState === 'loading' ? 'Lancement…' : parseState === 'success' ? 'Lancé ✓' : 'Erreur'}
            </span>
          )}

          {menuOpen && menuPos && (
            <div
              role="menu"
              className="fixed z-50 bg-white rounded-xl py-1 min-w-[152px]"
              style={{ top: menuPos.top, bottom: menuPos.bottom, right: menuPos.right, boxShadow: '0 4px 20px rgba(79,0,103,0.14)', border: '1px solid rgba(79,0,103,0.08)' }}
            >
              {[
                { icon: 'person',  label: 'Voir profil',  onClick: () => { setMenuOpen(false); navigate(`/candidates/${candidate.id}`) } },
                { icon: 'article', label: 'Voir CV',      onClick: () => setMenuOpen(false) },
                ...(candidate.cv_link && !candidate.is_parsed ? [{ icon: 'auto_awesome', label: 'Parser le CV', onClick: handleParseCv }] : []),
              ].map(({ icon, label, onClick }) => (
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

function getPageNumbers(current, last) {
  if (last <= 5) return Array.from({ length: last }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, '…', last]
  if (current >= last - 2) return [1, '…', last - 2, last - 1, last]
  return [1, '…', current - 1, current, current + 1, '…', last]
}

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

export default function CandidateTable({ candidates = [], meta = null, onPageChange }) {
  const currentPage = meta?.current_page ?? 1
  const lastPage    = meta?.last_page    ?? 1
  const total       = meta?.total        ?? candidates.length
  const perPage     = meta?.per_page     ?? candidates.length
  const from        = total === 0 ? 0 : (currentPage - 1) * perPage + 1
  const to          = Math.min(currentPage * perPage, total)
  return (
    <div className="bg-white rounded-2xl shadow-purple-sm">
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
          {total === 0
            ? 'Aucun résultat'
            : `Affichage ${from}–${to} sur ${total.toLocaleString('fr-FR')} candidats`}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2.5 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
              transition-colors duration-150 active:scale-[0.94] disabled:opacity-40 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim"
            aria-label="Page précédente"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {getPageNumbers(currentPage, lastPage).map((n) =>
            n === '…'
              ? <span key={n + Math.random()} className="px-1 text-outline text-[13px]">…</span>
              : <button
                  key={n}
                  onClick={() => onPageChange?.(n)}
                  className={`w-10 h-10 rounded-lg text-[13px] font-bold transition-colors duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2
                    ${n === currentPage
                      ? 'text-on-primary bg-primary'
                      : 'text-outline hover:bg-primary-fixed active:scale-[0.94]'}`}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? 'page' : undefined}
                >
                  {n}
                </button>
          )}

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= lastPage}
            className="p-2.5 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
              transition-colors duration-150 active:scale-[0.94] disabled:opacity-40 disabled:cursor-not-allowed
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
