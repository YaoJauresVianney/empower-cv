import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import FilterBar from '../components/FilterBar'
import FilterSelect from '../components/FilterSelect'
import StatCard from '../components/StatCard'
import DashboardCandidateTable from '../components/DashboardCandidateTable'
import ImagePromoCard from '../components/ImagePromoCard'
import HiringTrendsCard from '../components/HiringTrendsCard'
import ChatWidget from '../components/ChatWidget'
import { getCandidates, getJobOffers, getCandidateStats, getShortlistStats } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import '../dashboard.css'

const STATUS_OPTIONS = ['Tous les statuts', 'Présélectionné', 'En entretien', 'Nouveau', 'Refusé']
const ROLE_OPTIONS   = ['Tous les rôles', 'Designer Produit', 'Ingénieur Frontend', 'Responsable Marketing']
const SORT_OPTIONS   = ['Score : décroissant', 'Score : croissant']

const STALE = { staleTime: Infinity }

const PROMO_IMAGE_SRC = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYCwxqlQhVxmNdujpppD6ydo9HdVvIQPJ2cNe3ptSPy6V8wxrHNbZtcq0QSNjtl4cbIV0gfRFtGxeudiBDJNcHO5LMzDfHew8sWTLea1LrtFONiT11FwSM-A00zKc-Kjbth4OSC4l5y2GoajgSixvZQsZV0snpoIAcnNhY3pavxs0md0y_GVhwCnsQzmXBUP9XEE8pwSIDvaTyOhSAVp_VZwnd1QaCL7bYpUFvgfeGTR6rcjXehNX-HFeZnlX72sE20HykgQX8oaqw'

const toFr = (n) => n != null ? n.toLocaleString('fr-FR') : '—'

const parsedPct = (stats) => {
  if (!stats?.total) return '—'
  return `${Math.round(stats.parsed / stats.total * 100)}% prêts pour le matching`
}

export default function DashboardPage() {
  const user = useAuth().getUser()

  const { data: jobOffersStats } = useQuery({
    queryKey: ['job-offers-dashboard'],
    queryFn: () => getJobOffers().then(res => {
      const offers = res.data?.data ?? res.data ?? []
      return {
        total:     offers.length,
        completed: offers.filter(j => j.parse_status === 'completed').length,
      }
    }),
    ...STALE,
  })

  const { data: candidateStats } = useQuery({
    queryKey: ['candidate-stats-dashboard'],
    queryFn: () => getCandidateStats().then(res => res.data),
    ...STALE,
  })

  const { data: shortlistStats } = useQuery({
    queryKey: ['shortlist-stats-dashboard'],
    queryFn: () => getShortlistStats().then(res => res.data),
    ...STALE,
  })

  const { data: candidatesData } = useQuery({
    queryKey: ['candidates-dashboard'],
    queryFn: ({ signal }) => getCandidates(1, '', {}, signal)
      .then(res => ({
        candidates: (res.data?.data ?? []).slice(0, 5),
        total:      res.data?.meta?.total ?? null,
      })),
  })

  const avgScore = shortlistStats?.avg_score ?? null

  const stats = [
    {
      label:     'Total candidats',
      value:     toFr(candidatesData?.total),
      trend:     parsedPct(candidateStats),
      trendIcon: 'person_search',
      positive:  true,
    },
    {
      label:     'Offres actives',
      value:     jobOffersStats?.total != null ? String(jobOffersStats.total) : '—',
      trend:     jobOffersStats?.completed != null ? `${jobOffersStats.completed} prêtes pour le matching` : '—',
      trendIcon: 'check_circle',
      positive:  true,
    },
    {
      label:     'Candidats disponibles pour matching',
      value:     toFr(candidateStats?.parsed),
      trend:     'CVs analysés avec succès',
      trendIcon: 'person_search',
      positive:  true,
    },
    {
      label: 'Score moyen de correspondance',
      value: avgScore != null ? `${avgScore}%` : '—',
      bar:   avgScore ?? 0,
    },
  ]

  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} animationDelay={`${i * 65}ms`} />
        ))}
      </div>

      <FilterBar>
        <FilterSelect options={STATUS_OPTIONS} />
        <FilterSelect options={ROLE_OPTIONS} />
        <FilterSelect options={SORT_OPTIONS} />
      </FilterBar>

      <DashboardCandidateTable
        candidates={candidatesData?.candidates ?? []}
        total={candidatesData?.total ?? null}
      />

      <div className="flex justify-end mt-3 mb-2">
        <Link
          to="/candidates"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-primary transition-colors duration-150 group"
        >
          Voir plus
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform duration-150">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        <ImagePromoCard
          tag="Sourcing alimenté par l'IA"
          title="Trouvez votre prochain talent"
          description="Associez les candidats au profil de performance de vos meilleurs éléments. Notre moteur révèle les talents que vous auriez manqués."
          cta="Commencer le sourcing"
          imageSrc={PROMO_IMAGE_SRC}
          imageAlt="Une équipe de recruteurs collaborant dans un bureau moderne et lumineux"
        />
        <HiringTrendsCard />
      </div>

      {user?.id && <ChatWidget />}
    </AppLayout>
  )
}
