import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import BackButton from '../components/BackButton'
import SkillTag from '../components/SkillTag'
import SectionCard from '../components/SectionCard'
import InfoRow from '../components/InfoRow'
import { getJobOffer, getJobShortlists, generateShortlist, getShortlistStatus } from '../services/api'
import { formatRetryAt } from '../utils/formatters'
import '../dashboard.css'

const STATUS_CFG = {
  pending:    { label: 'En attente',   bg: 'bg-surface-container',    text: 'text-outline' },
  processing: { label: 'En cours',     bg: 'bg-primary-fixed',        text: 'text-primary' },
  completed:  { label: 'Terminée',     bg: 'bg-[#dcfce7]',            text: 'text-[#16a34a]' },
  failed:     { label: 'Échouée',      bg: 'bg-error-container',      text: 'text-error' },
}

function ShortlistRow({ shortlist, onClick }) {
  const cfg = STATUS_CFG[shortlist.status] ?? STATUS_CFG.pending
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 py-3 border-b border-outline-variant/30
        last:border-0 hover:bg-primary-fixed/40 transition-colors duration-150 text-left px-1 rounded-lg"
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-on-surface truncate">{shortlist.name}</p>
        <p className="text-[11px] text-text-muted mt-0.5">{shortlist.createdAt}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-[12px] font-medium text-outline tabular-nums">
          {shortlist.candidates} candidat{shortlist.candidates !== 1 ? 's' : ''}
        </span>
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      </div>
    </button>
  )
}

export default function JobOfferDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [generatingId, setGeneratingId] = useState(null)
  const [generateError, setGenerateError] = useState(null)
  const [rateLimit429, setRateLimit429] = useState(null)
  const [expiredLimitTs, setExpiredLimitTs] = useState(0)
  const errorTimerRef = useRef(null)

  const { data: offer, isLoading: offerLoading, isError: offerError } = useQuery({
    queryKey: ['job-offer', id],
    queryFn: () => getJobOffer(id).then((res) => ({
      ...(res.data?.data ?? res.data),
      quota: res.data?.quota ?? null,
    })),
    retry: 1,
  })

  const { data: shortlists = [], isLoading: shortlistsLoading, isError: shortlistsError } = useQuery({
    queryKey: ['job-shortlists', id],
    queryFn: () => getJobShortlists(id).then((res) => res.data?.data ?? []),
    retry: 1,
  })

  useEffect(() => {
    if (!generatingId) return

    let attempts = 0
    const MAX = 40

    const poll = async () => {
      if (attempts >= MAX) { setGeneratingId(null); return }
      attempts++
      try {
        const res = await getShortlistStatus(generatingId)
        const status = res.data?.status
        if (status === 'completed' || status === 'failed') {
          setGeneratingId(null)
          if (status === 'failed') {
            setGenerateError('La génération a échoué.')
            errorTimerRef.current = setTimeout(() => setGenerateError(null), 5000)
          }
          queryClient.invalidateQueries({ queryKey: ['job-shortlists', id] })
        }
      } catch { /* ignore transient errors */ }
    }

    poll()
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [generatingId, id, queryClient])

  useEffect(() => () => clearTimeout(errorTimerRef.current), [])

  const quotaRetryTs = offer?.quota?.remaining === 0 && offer.quota.retry_at
    ? new Date(offer.quota.retry_at).getTime()
    : null
  const limitTs = Math.max(rateLimit429?.getTime() ?? 0, quotaRetryTs ?? 0) || null
  const rateLimitedUntil = limitTs && limitTs > expiredLimitTs ? new Date(limitTs) : null

  useEffect(() => {
    if (!limitTs) return
    const delay = Math.max(0, limitTs - Date.now())
    const timer = setTimeout(() => setExpiredLimitTs(limitTs), delay)
    return () => clearTimeout(timer)
  }, [limitTs])

  const handleGenerate = async () => {
    if (generatingId) return
    setGenerateError(null)
    try {
      const res = await generateShortlist(id)
      setGeneratingId(res.data?.shortlist_id)
      queryClient.invalidateQueries({ queryKey: ['job-offer', id] })
    } catch (err) {
      if (err?.response?.status === 429 && err.response.data?.error === 'rate_limit_reached') {
        setRateLimit429(new Date(err.response.data.retry_at))
        return
      }
      const msg = err?.response?.data?.message ?? 'Impossible de lancer la génération.'
      setGenerateError(msg)
      errorTimerRef.current = setTimeout(() => setGenerateError(null), 5000)
    }
  }

  const canGenerate = offer?.parse_status === 'completed' && !generatingId && !rateLimitedUntil

  const loading = offerLoading || shortlistsLoading
  const error   = offerError || shortlistsError ? "Impossible de charger l'offre." : null

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

  if (error || !offer) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <span className="material-symbols-outlined text-[44px] text-text-muted">work_off</span>
          <p className="text-[14px] text-text-muted">{error ?? 'Offre introuvable.'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="text-[13px] font-semibold hover:underline"
            style={{ color: '#4f0067' }}
          >
            Retour aux offres
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <BackButton onClick={() => navigate('/jobs')}>Retour aux offres</BackButton>

      {/* Hero */}
      <div
        className="animate-in bg-white rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }}
      >
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-on-surface leading-tight">{offer.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-[13px] text-text-muted flex-wrap">
            {offer.publishedAt && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                Publiée le {offer.publishedAt}
              </span>
            )}
            {offer.candidates > 0 && (
              <span className="flex items-center gap-1" style={{ color: '#4f0067' }}>
                <span className="material-symbols-outlined text-[15px]">group</span>
                {offer.candidates} candidature{offer.candidates > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {offer.fileUrl && (
          <a
            href={offer.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              transition-colors duration-150"
            style={{ background: '#4f0067', color: '#fff' }}
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            Voir le fichier
          </a>
        )}
      </div>

      {/* Infos + Compétences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SectionCard title="Détails du poste" icon="work">
          <InfoRow label="Secteur"         value={offer.sector} />
          <InfoRow label="Type de contrat" value={offer.jobType} />
          <InfoRow label="Localisation"    value={offer.location} />
          <InfoRow
            label="Expérience requise"
            value={offer.experienceYears != null
              ? `${offer.experienceYears} an${offer.experienceYears > 1 ? 's' : ''}`
              : null}
          />
          <InfoRow label="Candidatures" value={String(offer.candidates ?? 0)} />
        </SectionCard>

        <SectionCard title="Compétences clés" icon="psychology">
          {offer.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {offer.skills.map((skill) => (
                <SkillTag key={skill} skill={skill} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-text-muted py-1">Aucune compétence renseignée.</p>
          )}
        </SectionCard>
      </div>

      {/* Shortlists */}
      <SectionCard
        title={`Shortlists (${shortlists.length})`}
        icon="playlist_add_check"
        headerAction={
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            title={offer?.parse_status !== 'completed' ? "L'offre doit être analysée avant de générer une shortlist" : undefined}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#4f0067', color: '#fff' }}
          >
            {generatingId ? (
              <>
                <span className="material-symbols-outlined text-[14px]" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                Génération…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Générer une shortlist
              </>
            )}
          </button>
        }
      >
        {rateLimitedUntil && (
          <div className="flex items-start gap-2.5 mb-3 px-3.5 py-3 rounded-xl bg-surface-container">
            <span className="material-symbols-outlined text-[18px] text-outline mt-0.5">schedule</span>
            <p className="text-[12.5px] text-on-surface leading-relaxed">
              Vous avez atteint votre limite de génération de shortlist.{' '}
              <span className="font-semibold">
                Vous pourrez en générer une {formatRetryAt(rateLimitedUntil)}.
              </span>
            </p>
          </div>
        )}
        {generateError && (
          <p className="text-[12px] font-medium mb-3" style={{ color: 'var(--color-error)' }}>
            {generateError}
          </p>
        )}
        {shortlists.length === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-[32px] text-text-muted block mb-2">
              format_list_bulleted
            </span>
            <p className="text-[13px] text-text-muted">Aucune shortlist générée pour cette offre.</p>
          </div>
        ) : (
          shortlists.map((sl) => (
            <ShortlistRow
              key={sl.id}
              shortlist={sl}
              onClick={() => navigate(`/jobs/${id}/shortlists/${sl.id}`)}
            />
          ))
        )}
      </SectionCard>
    </AppLayout>
  )
}
