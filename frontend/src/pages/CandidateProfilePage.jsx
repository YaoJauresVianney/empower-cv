import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import AppLayout from '../components/AppLayout'
import StatusBadge from '../components/StatusBadge'
import CandidateAvatar from '../components/CandidateAvatar'
import BackButton from '../components/BackButton'
import ScoreRing from '../components/ScoreRing'
import SectionCard from '../components/SectionCard'
import InfoRow from '../components/InfoRow'
import TagList from '../components/TagList'
import { getCandidate, parseCandidateCv, getCandidateParseStatus } from '../services/api'
import { formatExperienceYears } from '../utils/formatters'
import '../dashboard.css'

const PARSE_POLL_INTERVAL = 3000
const PARSE_POLL_MAX_ATTEMPTS = 20
const PRIMARY_COLOR = '#4f0067'
const HERO_SHADOW_STYLE = { boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }

export default function CandidateProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const shortlistScore = location.state?.score ?? null
  const shortlistName  = location.state?.shortlistName ?? null
  const queryClient = useQueryClient()

  const { data: candidate, isLoading, isError } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => getCandidate(id).then((res) => res.data?.data ?? res.data),
    retry: 1,
  })

  const [parseState, setParseState] = useState('idle') // idle | loading | success | error
  const pollRef      = useRef(null)
  const attemptsRef  = useRef(0)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const handleParse = useCallback(async () => {
    if (parseState === 'loading') return
    setParseState('loading')
    attemptsRef.current = 0

    try {
      await parseCandidateCv(id)
    } catch {
      setParseState('error')
      return
    }

    stopPolling()
    pollRef.current = setInterval(async () => {
      attemptsRef.current += 1

      if (attemptsRef.current > PARSE_POLL_MAX_ATTEMPTS) {
        stopPolling()
        setParseState('error')
        return
      }

      try {
        const res = await getCandidateParseStatus(id)
        const { parse_status: parseStatusResult, parsed_data: freshParsedData } = res.data ?? {}

        if (parseStatusResult === 'completed') {
          stopPolling()
          queryClient.setQueryData(['candidate', id], (prev) =>
            prev ? { ...prev, parsed_data: freshParsedData } : prev
          )
          setParseState('success')
        } else if (parseStatusResult === 'failed') {
          stopPolling()
          setParseState('error')
        }
      } catch {
        stopPolling()
        setParseState('error')
      }
    }, PARSE_POLL_INTERVAL)
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
          <p className="text-[14px] text-text-muted">
            {isError ? 'Impossible de charger le profil.' : 'Candidat introuvable.'}
          </p>
          <button
            onClick={() => navigate('/candidates')}
            className="text-[13px] font-semibold hover:underline"
            style={{ color: PRIMARY_COLOR }}
          >
            Retour à la liste
          </button>
        </div>
      </AppLayout>
    )
  }

  const candidateName   = candidate.name ?? 'Nom inconnu'
  const candidateStatus = candidate.status ?? 'Nouveau'
  const parsedData      = candidate.parsed_data

  return (
    <AppLayout>
      <BackButton onClick={() => navigate('/candidates')}>Retour aux candidats</BackButton>

      {/* Hero */}
      <div
        className="animate-in bg-white rounded-2xl p-6 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={HERO_SHADOW_STYLE}
      >
        <div className="flex items-center gap-5 min-w-0">
          <CandidateAvatar name={candidateName} avatar={candidate.avatar} size="lg" />

          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-on-surface leading-tight truncate">{candidateName}</h1>
            <p className="text-[14px] text-text-muted mt-0.5 truncate">{candidate.role ?? '—'}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <StatusBadge status={candidateStatus} />
              {parsedData?.experience_years > 0 && (
                <span className="text-[12px] text-text-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">work_history</span>
                  {formatExperienceYears(parsedData.experience_years)} d'expérience
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
          <InfoRow label="Localisation" value={candidate.location ?? parsedData?.location ?? null} />
        </SectionCard>

        <SectionCard title="Candidature" icon="assignment_ind">
          <InfoRow label="Poste visé"    value={parsedData?.current_title || candidate.role} />
          <InfoRow label="Secteur"       value={parsedData?.sector || null} />
          <InfoRow label="Type de poste" value={parsedData?.job_type || null} />
          <InfoRow label="Statut"><StatusBadge status={candidateStatus} /></InfoRow>
          <InfoRow
            label="Expérience"
            value={parsedData?.experience_years != null ? formatExperienceYears(parsedData.experience_years) : null}
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
              style={{ background: 'var(--color-primary-fixed)', color: PRIMARY_COLOR }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-fixed-dim)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-primary-fixed)' }}
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              Voir le CV
              <span className="material-symbols-outlined text-[14px] ml-auto">open_in_new</span>
            </a>
          ) : (
            <p className="text-[13px] text-text-muted py-3">Aucun document disponible.</p>
          )}
          {candidate.cv_link && (parseState !== 'idle' || !parsedData) && (
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
                  style={{ background: PRIMARY_COLOR, color: '#fff' }}
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
          <TagList items={parsedData?.skills} empty="CV non encore parsé." />
          {parsedData && (
            <p className="text-[11px] text-text-muted mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              Extraites automatiquement depuis le CV.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Formation" icon="school">
          <TagList items={parsedData?.education} empty="Aucune formation détectée." />
        </SectionCard>

        <SectionCard title="Langues" icon="translate">
          <TagList items={parsedData?.languages} empty="Aucune langue détectée." />
        </SectionCard>
      </div>

      {parsedData?.certifications?.length > 0 && (
        <div className="mt-4">
          <SectionCard title="Certifications" icon="verified">
            <TagList items={parsedData.certifications} empty="" />
          </SectionCard>
        </div>
      )}
    </AppLayout>
  )
}
