import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import BackButton from '../components/BackButton'
import SkillTag from '../components/SkillTag'
import { getJobOffer, getJobShortlists } from '../services/api'
import '../dashboard.css'

const STATUS_CFG = {
  pending:    { label: 'En attente',   bg: 'bg-surface-container',    text: 'text-outline' },
  processing: { label: 'En cours',     bg: 'bg-primary-fixed',        text: 'text-primary' },
  completed:  { label: 'Terminée',     bg: 'bg-[#dcfce7]',            text: 'text-[#16a34a]' },
  failed:     { label: 'Échouée',      bg: 'bg-error-container',      text: 'text-error' },
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

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-outline-variant/30 last:border-0">
      <span className="text-[12px] text-text-muted font-medium whitespace-nowrap">{label}</span>
      <span className="text-[13px] font-semibold text-on-surface truncate text-right">{value ?? '—'}</span>
    </div>
  )
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
  const [offer, setOffer]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [shortlists, setShortlists] = useState([])

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getJobOffer(id),
      getJobShortlists(id),
    ])
      .then(([offerRes, slRes]) => {
        setOffer(offerRes.data?.data ?? offerRes.data)
        setShortlists(slRes.data?.data ?? [])
      })
      .catch(() => setError("Impossible de charger l'offre."))
      .finally(() => setLoading(false))
  }, [id])

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
      <SectionCard title={`Shortlists (${shortlists.length})`} icon="playlist_add_check">
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
