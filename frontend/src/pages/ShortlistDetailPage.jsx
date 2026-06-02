import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import BackButton from '../components/BackButton'
import { getShortlistStatus } from '../services/api'
import '../dashboard.css'

const STATUS_CFG = {
  pending:    { label: 'En attente',  bg: 'bg-surface-container', text: 'text-outline' },
  processing: { label: 'En cours',    bg: 'bg-primary-fixed',     text: 'text-primary' },
  completed:  { label: 'Terminée',    bg: 'bg-[#dcfce7]',         text: 'text-[#16a34a]' },
  failed:     { label: 'Échouée',     bg: 'bg-error-container',   text: 'text-error' },
}

function ScoreBar({ score }) {
  return (
    <div className="flex items-center gap-3 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-surface-container overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: '#4f0067' }}
        />
      </div>
      <span className="text-[13px] font-bold tabular-nums w-9 text-right" style={{ color: '#4f0067' }}>
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
            aria-label="Voir le CV"
            className="inline-flex items-center justify-center p-1.5 rounded-lg text-outline
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
  const { jobId, slId } = useParams()
  const navigate = useNavigate()

  const goToCandidate = (candidate) =>
    navigate(`/candidates/${candidate.candidate_id}`, {
      state: { score: candidate.score, shortlistName: data?.shortlist_name },
    })
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getShortlistStatus(slId)
      .then((res) => setData(res.data))
      .catch(() => setError('Impossible de charger la shortlist.'))
      .finally(() => setLoading(false))
  }, [slId])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <span
            className="material-symbols-outlined text-[36px] text-text-muted"
            style={{ animation: 'spin 1s linear infinite' }}
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
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <span className="material-symbols-outlined text-[44px] text-text-muted">playlist_remove</span>
          <p className="text-[14px] text-text-muted">{error ?? 'Shortlist introuvable.'}</p>
          <button
            onClick={() => navigate(`/jobs/${jobId}`)}
            className="text-[13px] font-semibold hover:underline"
            style={{ color: '#4f0067' }}
          >
            Retour à l'offre
          </button>
        </div>
      </AppLayout>
    )
  }

  const cfg = STATUS_CFG[data.status] ?? STATUS_CFG.pending
  const results = data.results ?? []
  const isProcessing = data.status === 'pending' || data.status === 'processing'

  return (
    <AppLayout>
      <BackButton onClick={() => navigate(`/jobs/${jobId}`)}>Retour à l'offre</BackButton>

      {/* Header */}
      <div
        className="animate-in bg-white rounded-2xl p-6 mb-5 flex items-center justify-between gap-4"
        style={{ boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }}
      >
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">{data.shortlist_name}</h1>
          <p className="text-[13px] text-text-muted mt-1">
            {results.length} candidat{results.length !== 1 ? 's' : ''} classé{results.length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-purple-sm">
        {isProcessing ? (
          <div className="py-16 text-center">
            <span
              className="material-symbols-outlined text-[36px] block mb-3"
              style={{ color: '#4f0067', animation: 'spin 1s linear infinite' }}
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/50">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted w-10">#</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">Candidat</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted w-48">Score</th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted text-center w-16">CV</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c, i) => (
                <CandidateRow key={i} rank={i + 1} candidate={c} onClick={() => goToCandidate(c)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  )
}
