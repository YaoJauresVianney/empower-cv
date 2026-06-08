import { useEffect, useMemo, useState, useCallback } from 'react'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SearchInput from '../components/SearchInput'
import StatCard from '../components/StatCard'
import JobOffersTable from '../components/JobOffersTable'
import { useAuth } from '../hooks/useAuth'
import { getJobOffers } from '../services/api'
import '../dashboard.css'

function buildStats(offers) {
  const totalCandidates = offers.reduce((sum, o) => sum + (o.candidates ?? 0), 0)
  const withCandidates = offers.filter((o) => (o.candidates ?? 0) > 0).length
  const withExp = offers.filter((o) => (o.experienceYears ?? 0) > 0)
  const avgExperience = withExp.length > 0
    ? Math.round(withExp.reduce((sum, o) => sum + o.experienceYears, 0) / withExp.length)
    : 0
  const conversionRate = offers.length > 0
    ? Math.round((withCandidates / offers.length) * 100)
    : 0

  return [
    {
      label: 'Offres publiées',
      value: String(offers.length),
      trend: `${withCandidates} avec candidature${withCandidates !== 1 ? 's' : ''}`,
      trendIcon: 'work',
      positive: null,
    },
    {
      label: 'Candidatures reçues',
      value: String(totalCandidates),
      trend: `Moy. ${Math.round(totalCandidates / Math.max(offers.length, 1))} par offre`,
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
  const q = query.toLowerCase()
  return (
    offer.title.toLowerCase().includes(q) ||
    (offer.skills ?? []).some((s) => s.toLowerCase().includes(q))
  )
}

export default function JobOffersPage() {
  const { getUser } = useAuth()
  const userName = getUser()?.name ?? 'recruteur'

  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)  // true dès le départ — évite le flash de contenu vide
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    getJobOffers()
      .then(({ data }) => {
        if (!cancelled) setOffers(data?.data ?? data ?? [])
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ?? 'Impossible de charger les offres.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const handleOfferUpdate = useCallback((id, patch) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
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
        cta={{ label: 'Publier une offre', icon: 'add' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} animationDelay={`${i * 65}ms`} />
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
    </AppLayout>
  )
}
