import { useCallback, useEffect, useReducer } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import BackButton from '../components/BackButton'
import { getShortlistStatus } from '../services/api'
import '../dashboard.css'

const SPIN_ANIMATION = 'spin 1s linear infinite'
const PROCESSING_STATUSES = new Set(['pending', 'processing'])
const POLL_INTERVAL_MS = 5000

const INITIAL_FETCH_STATE = { data: null, loading: true, error: null }

function fetchReducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { data: null, loading: true, error: null }
    case 'SUCCESS': return { data: action.data, loading: false, error: null }
    case 'ERROR':   return { data: null, loading: false, error: action.error }
    default:        return state
  }
}

const STATUS_CONFIG = {
  pending:    { label: 'En attente',  bg: 'bg-surface-container',    text: 'text-outline' },
  processing: { label: 'En cours',    bg: 'bg-primary-fixed',         text: 'text-primary' },
  completed:  { label: 'Terminée',    bg: 'bg-status-success-bg',     text: 'text-status-success-text' },
  failed:     { label: 'Échouée',     bg: 'bg-error-container',       text: 'text-error' },
}

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-3 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: 'var(--color-primary)' }}
        />
      </div>
      <span
        className="text-[13px] font-bold tabular-nums w-9 text-right"
        style={{ color: 'var(--color-primary)' }}
      >
        {Math.round(score)}
      </span>
    </div>
  )
}

function CandidateRow({ rank, candidate, onClick }) {
  return (
    <tr
      className="border-b border-outline-variant/30 last:border-0 hover:bg-primary-fixed/30
        transition-colors duration-150 cursor-pointer group"
      onClick={onClick}
    >
      <td className="px-5 py-3.5 text-[13px] font-bold text-outline tabular-nums w-10">
        #{rank}
      </td>
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-semibold text-on-surface group-hover:text-primary transition-colors duration-150">
          {candidate.candidate_name}
        </p>
      </td>
      <td className="px-5 py-3.5 w-48">
        <ScoreBar score={candidate.score} />
      </td>
      <td className="px-5 py-3.5 text-center w-16" onClick={(e) => e.stopPropagation()}>
        {candidate.cv_link ? (
          <a
            href={candidate.cv_link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir le CV de ${candidate.candidate_name}`}
            className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-outline
              hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
          </a>
        ) : (
          <span className="text-[13px] text-text-muted">—</span>
        )}
      </td>
    </tr>
  )
}

export default function ShortlistDetailPage() {
  const { jobId, slId: shortlistId } = useParams()
  const navigate = useNavigate()

  const [{ data, loading, error }, dispatch] = useReducer(fetchReducer, INITIAL_FETCH_STATE)

  const goToCandidate = useCallback(
    (candidate) =>
      navigate(`/candidates/${candidate.candidate_id}`, {
        state: { score: candidate.score, shortlistName: data?.shortlist_name },
      }),
    [navigate, data?.shortlist_name],
  )

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'LOADING' })
    getShortlistStatus(shortlistId)
      .then((response) => {
        if (!cancelled) dispatch({ type: 'SUCCESS', data: response.data })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'ERROR', error: 'Impossible de charger la shortlist.' })
      })
    return () => { cancelled = true }
  }, [shortlistId])

  const status = data?.status

  useEffect(() => {
    if (!PROCESSING_STATUSES.has(status)) return undefined

    let cancelled = false
    const intervalId = setInterval(() => {
      getShortlistStatus(shortlistId)
        .then((response) => {
          if (!cancelled) dispatch({ type: 'SUCCESS', data: response.data })
        })
        .catch(() => {
          // Erreur transitoire : on garde l'affichage actuel, nouvel essai au prochain tick.
        })
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [status, shortlistId])

  if (loading) {
    return (
      <AppLayout>
        <div
          role="status"
          aria-label="Chargement de la shortlist"
          className="flex items-center justify-center h-64"
        >
          <span
            className="material-symbols-outlined text-[36px] text-text-muted"
            style={{ animation: SPIN_ANIMATION }}
          >
            progress_activity
          </span>
        </div>
      </AppLayout>
    )
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div role="alert" className="flex flex-col items-center justify-center h-64 gap-3">
          <span className="material-symbols-outlined text-[44px] text-text-muted">playlist_remove</span>
          <p className="text-[14px] text-text-muted">{error ?? 'Shortlist introuvable.'}</p>
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="text-[13px] font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Retour à l'offre
          </button>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = STATUS_CONFIG[data.status] ?? STATUS_CONFIG.pending
  const results = data.results ?? []
  const isProcessing = PROCESSING_STATUSES.has(data.status)
  const plural = results.length !== 1 ? 's' : ''

  return (
    <AppLayout>
      <BackButton onClick={() => navigate(`/jobs/${jobId}`)}>Retour à l'offre</BackButton>

      <div className="animate-in bg-white rounded-2xl p-6 mb-5 flex items-center justify-between gap-4 shadow-purple-sm">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">{data.shortlist_name}</h1>
          <p className="text-[13px] text-text-muted mt-1">
            {results.length} candidat{plural} classé{plural}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
          {statusConfig.label}
        </span>
      </div>

      <div
        className="animate-in bg-white rounded-2xl overflow-hidden shadow-purple-sm"
        style={{ animationDelay: '80ms' }}
      >
        {isProcessing ? (
          <div className="py-16 text-center">
            <span
              className="material-symbols-outlined text-[36px] block mb-3"
              style={{ color: 'var(--color-primary)', animation: SPIN_ANIMATION }}
            >
              progress_activity
            </span>
            <p className="text-[14px] font-semibold text-on-surface">Analyse en cours…</p>
            <p className="text-[13px] text-text-muted mt-1">Les résultats apparaîtront ici une fois terminé.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[36px] text-text-muted block mb-3">
              person_search
            </span>
            <p className="text-[14px] font-semibold text-on-surface">Aucun candidat dans cette shortlist.</p>
          </div>
        ) : (
          <>
            {/* Mobile card list — hidden above sm breakpoint */}
            <div className="sm:hidden divide-y divide-outline-variant/30">
              {results.map((candidate, index) => (
                <div
                  key={candidate.candidate_id ?? index}
                  className="px-4 py-4 flex items-center gap-3 cursor-pointer hover:bg-primary-fixed/20 transition-colors duration-150"
                  onClick={() => goToCandidate(candidate)}
                >
                  <span className="text-[13px] font-bold text-outline tabular-nums w-6 flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-on-surface truncate">
                      {candidate.candidate_name}
                    </p>
                    <div className="mt-2">
                      <ScoreBar score={candidate.score} />
                    </div>
                  </div>
                  {candidate.cv_link && (
                    <a
                      href={candidate.cv_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Voir le CV de ${candidate.candidate_name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg text-outline
                        hover:bg-primary-fixed/60 hover:text-primary transition-colors duration-150"
                    >
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table — hidden below sm breakpoint */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <caption className="sr-only">
                  Candidats classés dans la shortlist {data.shortlist_name}
                </caption>
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted w-10">#</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">Candidat</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted w-48">Score</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted text-center w-16">CV</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((candidate, index) => (
                    <CandidateRow
                      key={candidate.candidate_id ?? index}
                      rank={index + 1}
                      candidate={candidate}
                      onClick={() => goToCandidate(candidate)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
