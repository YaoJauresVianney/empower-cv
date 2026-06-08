import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import CandidateAvatar from '../components/CandidateAvatar'
import BackButton from '../components/BackButton'
import { getCandidate, parseCandidateCv, getCandidateParseStatus } from '../services/api'
import '../dashboard.css'

const PARSE_POLL_INTERVAL = 3000
const PARSE_POLL_MAX_ATTEMPTS = 20

function ScoreRing({ score }) {
  const r      = 36
  const circ   = 2 * Math.PI * r
  const offset = circ * (1 - (score ?? 0) / 100)
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative w-[88px] h-[88px]">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#fad7ff" strokeWidth="7" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke="#4f0067" strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[19px] font-bold tabular-nums" style={{ color: '#4f0067' }}>
            {score != null ? score : '—'}
          </span>
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">Score</p>
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="animate-in bg-white rounded-2xl p-5 shadow-purple-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[18px]" style={{ color: '#4f0067' }}>{icon}</span>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, children, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-outline-variant/30 last:border-0">
      <span className="text-[12px] text-text-muted font-medium whitespace-nowrap">{label}</span>
      {children ?? <span className="text-[13px] font-semibold text-on-surface truncate text-right">{value ?? '—'}</span>}
    </div>
  )
}

function TagList({ items, empty = 'Aucune donnée.' }) {
  if (!items?.length) return <p className="text-[13px] text-text-muted py-1">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span
          key={item}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-primary-fixed"
          style={{ color: '#4f0067' }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export default function CandidateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const shortlistScore = location.state?.score ?? null
  const shortlistName  = location.state?.shortlistName ?? null
  const queryClient = useQueryClient()
  const { data: candidate, isLoading, isError } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidate(id).then(res => res.data?.data ?? res.data),
    retry: 1,
  })
  const [parseState, setParseState] = useState('idle') // idle | loading | success | error
  const pollRef = useRef(null)
  const attemptsRef = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const handleParse = useCallback(() => {
    if (parseState === 'loading') return
    setParseState('loading')
    attemptsRef.current = 0

    parseCandidateCv(id)
      .then(() => {
        stopPolling()
        pollRef.current = setInterval(() => {
          attemptsRef.current += 1

          if (attemptsRef.current > PARSE_POLL_MAX_ATTEMPTS) {
            stopPolling()
            setParseState('error')
            return
          }

          getCandidateParseStatus(id)
            .then(res => {
              const { parse_status: status, parsed_data: parsed } = res.data ?? {}

              if (status === 'completed') {
                stopPolling()
                queryClient.setQueryData(['candidate', id], prev =>
                  prev ? { ...prev, parsed_data: parsed } : prev
                )
                setParseState('success')
              } else if (status === 'failed') {
                stopPolling()
                setParseState('error')
              }
            })
            .catch(() => {
              stopPolling()
              setParseState('error')
            })
        }, PARSE_POLL_INTERVAL)
      })
      .catch(() => setParseState('error'))
  }, [id, parseState, stopPolling, queryClient])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-[36px] text-text-muted" style={{ animation: 'spin 1s linear infinite' }}>
            progress_activity
          </span>
        </div>
      </AppLayout>
    )
  }

  if (isError || !candidate) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <span className="material-symbols-outlined text-[44px] text-text-muted">person_off</span>
          <p className="text-[14px] text-text-muted">{isError ? 'Impossible de charger le profil.' : 'Candidat introuvable.'}</p>
          <button
            onClick={() => navigate('/candidates')}
            className="text-[13px] font-semibold hover:underline"
            style={{ color: '#4f0067' }}
          >
            Retour à la liste
          </button>
        </div>
      </AppLayout>
    )
  }

  const name      = candidate.name ?? 'Nom inconnu'
  const status    = candidate.status ?? 'Nouveau'
  const parsed    = candidate.parsed_data

  return (
    <AppLayout>
      <BackButton onClick={() => navigate('/candidates')}>Retour aux candidats</BackButton>

      {/* Hero */}
      <div
        className="animate-in bg-white rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{ boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }}
      >
        <div className="flex items-center gap-5 min-w-0">
          <CandidateAvatar name={name} avatar={candidate.avatar} size="lg" />

          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-on-surface leading-tight truncate">{name}</h1>
            <p className="text-[14px] text-text-muted mt-0.5 truncate">{candidate.role ?? '—'}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge status={status} />
              {parsed?.experience_years > 0 && (
                <span className="text-[12px] text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">work_history</span>
                  {parsed.experience_years} an{parsed.experience_years > 1 ? 's' : ''} d'expérience
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <ScoreRing score={shortlistScore ?? candidate.score} />
          {shortlistName && (
            <p className="text-[11px] text-text-muted text-right max-w-[120px] leading-tight">
              Score pour<br />
              <span className="font-semibold text-on-surface truncate block">{shortlistName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Grille info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <SectionCard title="Contact" icon="contact_mail">
          <InfoRow label="Email"        value={candidate.email} />
          <InfoRow label="Téléphone"    value={candidate.phone ?? null} />
          <InfoRow label="Localisation" value={candidate.location ?? parsed?.location ?? null} />
        </SectionCard>

        <SectionCard title="Candidature" icon="assignment_ind">
          <InfoRow label="Poste visé" value={candidate.role} />
          <InfoRow label="Secteur" value={parsed?.sector || null} />
          <InfoRow label="Type de poste" value={parsed?.job_type || null} />
          <InfoRow label="Statut"><StatusBadge status={status} /></InfoRow>
          <InfoRow
            label="Expérience"
            value={parsed?.experience_years != null ? `${parsed.experience_years} an${parsed.experience_years > 1 ? 's' : ''}` : null}
          />
        </SectionCard>

        <SectionCard title="Documents" icon="folder_open">
          {candidate.cv_link ? (
            <a
              href={candidate.cv_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-[13px] font-semibold
                transition-colors duration-150 mt-1"
              style={{ background: 'var(--color-primary-fixed)', color: '#4f0067' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-fixed-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-fixed)'}
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Voir le CV
              <span className="material-symbols-outlined text-[14px] ml-auto">open_in_new</span>
            </a>
          ) : (
            <p className="text-[13px] text-text-muted py-3">Aucun document disponible.</p>
          )}
          {candidate.cv_link && (parseState !== 'idle' || !parsed) && (
            <div className="mt-3">
              {parseState === 'success' ? (
                <p className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: '#16a34a' }}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Informations extraites avec succès.
                </p>
              ) : parseState === 'error' ? (
                <button
                  onClick={handleParse}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold
                    transition-all duration-150 text-error"
                  style={{ background: 'rgba(220,38,38,0.08)' }}
                >
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  Échec de l'extraction. Réessayer.
                </button>
              ) : (
                <button
                  onClick={handleParse}
                  disabled={parseState === 'loading'}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold
                    transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: '#4f0067', color: '#fff' }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {parseState === 'loading' ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  {parseState === 'loading' ? 'Extraction en cours…' : 'Extraire les informations'}
                </button>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Données parsées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Compétences" icon="psychology">
          <TagList items={parsed?.skills} empty="CV non encore parsé." />
          {parsed && (
            <p className="text-[11px] text-text-muted mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              Extraites automatiquement depuis le CV.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Formation" icon="school">
          <TagList items={parsed?.education} empty="Aucune formation détectée." />
        </SectionCard>

        <SectionCard title="Langues" icon="translate">
          <TagList items={parsed?.languages} empty="Aucune langue détectée." />
        </SectionCard>
      </div>
    </AppLayout>
  )
}
