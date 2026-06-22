import { memo, useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SkillTag from './SkillTag'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { parseJobOffer, getJobOfferParseStatus, openJobDescriptionFile } from '../services/api'

const POLL_INTERVAL_MS      = 3000
const POLL_MAX_ATTEMPTS     = 40
const MENU_ESTIMATED_HEIGHT = 180

const PARSE_STATUS_BADGE = {
  completed:  { cls: 'bg-green-50 text-green-700',      icon: 'check_circle',      label: 'Analysée' },
  processing: { cls: 'bg-amber-50 text-amber-700',      icon: 'progress_activity', label: 'En cours' },
  pending:    { cls: 'bg-amber-50 text-amber-700',      icon: 'progress_activity', label: 'En cours' },
  failed:     { cls: 'bg-error-container text-error',   icon: 'error',             label: 'Échec' },
}

const JobOfferRow = memo(function JobOfferRow({ offer, onOfferUpdate, onOfferDelete }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [parseError, setParseError] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const menuRef      = useRef(null)
  const triggerRef   = useRef(null)
  const errorTimerRef = useRef(null)

  const handleViewFile = useCallback(async () => {
    if (fileLoading) return
    setFileLoading(true)
    try {
      await openJobDescriptionFile(offer.id)
    } catch {
      // l'utilisateur peut réessayer
    } finally {
      setFileLoading(false)
    }
  }, [offer.id, fileLoading])

  const status      = offer.parse_status ?? null
  const isInProgress = status === 'pending' || status === 'processing'

  useEffect(() => () => clearTimeout(errorTimerRef.current), [])

  // Auto-polling while in progress — same pattern as CandidateRow
  useEffect(() => {
    if (!isInProgress) return
    let cancelled = false
    let attempts  = 0
    let timer     = null

    const check = () => {
      getJobOfferParseStatus(offer.id)
        .then((res) => {
          if (cancelled) return
          const next       = res.data?.parse_status ?? null
          const parsedData = res.data?.parsed_data  ?? null
          onOfferUpdate?.(offer.id, { parse_status: next, ...(parsedData ? { parsed_data: parsedData } : {}) })
        })
        .catch(() => {})
        .finally(() => {
          if (cancelled) return
          attempts += 1
          if (attempts < POLL_MAX_ATTEMPTS) timer = setTimeout(check, POLL_INTERVAL_MS)
        })
    }
    timer = setTimeout(check, POLL_INTERVAL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') { attempts = 0; clearTimeout(timer); check() }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isInProgress, offer.id, onOfferUpdate])

  const handleParse = useCallback(() => {
    if (isInProgress) return
    setMenuOpen(false)
    setParseError(false)
    const prev = { parse_status: offer.parse_status ?? null }
    onOfferUpdate?.(offer.id, { parse_status: 'pending' })
    parseJobOffer(offer.id)
      .catch(() => {
        onOfferUpdate?.(offer.id, prev)
        setParseError(true)
        errorTimerRef.current = setTimeout(() => setParseError(false), 3000)
      })
  }, [offer.id, offer.parse_status, isInProgress, onOfferUpdate])

  const closeMenu  = useCallback(() => setMenuOpen(false), [])
  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => {
      if (!prev && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setDropUp(rect.bottom + MENU_ESTIMATED_HEIGHT > window.innerHeight)
      }
      return !prev
    })
  }, [])

  const handleDelete = useCallback(() => {
    closeMenu()
    setConfirmOpen(true)
  }, [closeMenu])

  const handleConfirm = useCallback(() => {
    setDeleting(true)
    onOfferDelete?.(offer.id).catch(() => {
      setDeleting(false)
      setConfirmOpen(false)
    })
  }, [offer.id, onOfferDelete])

  useEffect(() => {
    if (!menuOpen) return
    const handleOutsideClick = (e) => {
      if (!menuRef.current?.contains(e.target)) closeMenu()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [menuOpen, closeMenu])

  const visibleSkills   = (offer.skills ?? []).slice(0, 3)
  const remainingSkills = Math.max(0, (offer.skills ?? []).length - 3)
  const parseBadge      = PARSE_STATUS_BADGE[status] ?? null
  const canParse        = offer.fileUrl && status !== 'completed' && !isInProgress

  const menuItems = [
    { icon: 'open_in_new', label: "Voir l'offre", onClick: () => { closeMenu(); navigate(`/jobs/${offer.id}`) } },
    { icon: 'edit',        label: 'Modifier',      onClick: closeMenu },
    { icon: 'delete',      label: 'Supprimer',     onClick: handleDelete },
    ...(canParse
      ? [{ icon: 'auto_awesome', label: status === 'failed' ? "Relancer l'analyse" : "Analyser l'offre", onClick: handleParse }]
      : []),
  ]

  return (
    <>
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
        <div className="flex flex-col items-center gap-1.5">
          {offer.fileUrl ? (
            <button
              type="button"
              onClick={handleViewFile}
              disabled={fileLoading}
              aria-label={`Voir le fichier : ${offer.title}`}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-outline
                hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-[20px] ${fileLoading ? 'animate-spin' : ''}`}>
                {fileLoading ? 'progress_activity' : 'picture_as_pdf'}
              </span>
            </button>
          ) : (
            <span className="text-[13px] text-text-muted">—</span>
          )}
          {parseBadge && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${parseBadge.cls}`}>
              <span className={`material-symbols-outlined text-[11px] ${isInProgress ? 'animate-spin' : ''}`}>
                {parseBadge.icon}
              </span>
              {parseBadge.label}
            </span>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="relative" ref={menuRef}>
          {parseError && (
            <span className="absolute right-8 top-1.5 text-[11px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-md text-error bg-error-container">
              Erreur
            </span>
          )}
          <button
            ref={triggerRef}
            onClick={toggleMenu}
            disabled={deleting}
            className={`p-1.5 rounded-lg text-outline hover:bg-primary-fixed/60 hover:text-primary active:scale-[0.95]
              transition-all duration-150
              focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            aria-label={`Plus d'options pour ${offer.title}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className={`material-symbols-outlined text-[20px] ${deleting ? 'animate-spin' : ''}`}>
              {deleting ? 'progress_activity' : 'more_horiz'}
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className={`absolute right-0 z-50 bg-white rounded-xl py-1 min-w-[168px] ${dropUp ? 'bottom-8' : 'top-8'}`}
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
                  disabled={deleting}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-on-surface
                    hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-100
                    disabled:opacity-40 disabled:cursor-not-allowed"
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

    {confirmOpen && (
      <ConfirmDeleteModal
        title={offer.title}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    )}
    </>
  )
})

export default JobOfferRow
