import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SearchInput from '../components/SearchInput'
import StatCard from '../components/StatCard'
import JobOffersTable from '../components/JobOffersTable'
import UploadJobDescription from '../components/UploadJobDescription'
import { useAuth } from '../hooks/useAuth'
import { getJobOffers } from '../services/api'
import ChatWidget from '../components/ChatWidget'
import '../dashboard.css'

const STAT_CARD_ANIMATION_STEP_MS = 65

function extractOffers(response) {
  return response.data?.data ?? response.data ?? []
}

function buildStats(offers) {
  const totalCandidates = offers.reduce((sum, offer) => sum + (offer.candidates ?? 0), 0)
  const offersWithCandidates = offers.filter((offer) => (offer.candidates ?? 0) > 0)
  const offersWithExperience = offers.filter((offer) => (offer.experienceYears ?? 0) > 0)

  const avgExperience =
    offersWithExperience.length > 0
      ? Math.round(
          offersWithExperience.reduce((sum, offer) => sum + offer.experienceYears, 0) /
            offersWithExperience.length,
        )
      : 0

  const conversionRate =
    offers.length > 0
      ? Math.round((offersWithCandidates.length / offers.length) * 100)
      : 0

  const avgCandidatesPerOffer = Math.round(totalCandidates / Math.max(offers.length, 1))
  const withCandidatesCount = offersWithCandidates.length

  return [
    {
      label: 'Offres publiées',
      value: String(offers.length),
      trend: `${withCandidatesCount} avec candidature${withCandidatesCount !== 1 ? 's' : ''}`,
      trendIcon: 'work',
      positive: null,
    },
    {
      label: 'Candidatures reçues',
      value: String(totalCandidates),
      trend: `Moy. ${avgCandidatesPerOffer} par offre`,
      trendIcon: 'person_add',
      positive: totalCandidates > 0,
    },
    {
      label: 'Expérience moyenne',
      value: `${avgExperience} an${avgExperience > 1 ? 's' : ''}`,
      trend: 'Requise sur les fiches de poste',
      trendIcon: 'workspace_premium',
      positive: null,
    },
    {
      label: 'Taux de conversion',
      value: `${conversionRate}%`,
      bar: conversionRate,
    },
  ]
}

function matchesSearch(offer, query) {
  if (query === '') return true
  const normalizedQuery = query.toLowerCase()
  return (
    offer.title.toLowerCase().includes(normalizedQuery) ||
    (offer.skills ?? []).some((skill) => skill.toLowerCase().includes(normalizedQuery))
  )
}

export default function JobOffersPage() {
  const navigate = useNavigate()
  const { getUser } = useAuth()
  const user = getUser()
  const userName = user?.name ?? 'recruteur'

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true) // true dès le départ — évite le flash de contenu vide
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    getJobOffers()
      .then((response) => {
        if (!cancelled) setOffers(extractOffers(response))
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? 'Impossible de charger les offres.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleOfferUpdate = useCallback((id, patch) => {
    setOffers((prev) => prev.map((offer) => (offer.id === id ? { ...offer, ...patch } : offer)))
  }, [])

  const stats = useMemo(() => buildStats(offers), [offers])

  const filteredOffers = useMemo(
    () => offers.filter((offer) => matchesSearch(offer, search)),
    [offers, search],
  )

  return (
    <AppLayout>
      <PageHeader
        title="Offres d'emploi"
        subtitle={`Bonjour ${userName} — gérez et suivez vos offres publiées`}
        cta={{ label: 'Publier une offre', icon: 'add', onClick: () => setPublishOpen(true) }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            {...stat}
            animationDelay={`${index * STAT_CARD_ANIMATION_STEP_MS}ms`}
          />
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 mb-4 rounded-xl px-4 py-3 text-[13px] font-medium"
          style={{
            background: 'var(--color-error-container)',
            color: 'var(--color-on-error-container)',
          }}
        >
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <FilterBar>
        <SearchInput
          placeholder="Rechercher par titre ou compétence…"
          value={search}
          onChange={setSearch}
        />
      </FilterBar>

      <JobOffersTable
        offers={filteredOffers}
        totalCount={offers.length}
        loading={loading}
        onOfferUpdate={handleOfferUpdate}
      />
      {user?.id && <ChatWidget />}

      {publishOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setPublishOpen(false) }}
        >
          <UploadJobDescription
            onUploadSuccess={(id) => { setPublishOpen(false); navigate(`/jobs/${id}`) }}
            onCancel={() => setPublishOpen(false)}
          />
        </div>
      )}
    </AppLayout>
  )
}
