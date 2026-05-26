import AppLayout from '../components/AppLayout'
import FilterBar from '../components/FilterBar'
import FilterSelect from '../components/FilterSelect'
import StatCard from '../components/StatCard'
import CandidateTable from '../components/CandidateTable'
import ImagePromoCard from '../components/ImagePromoCard'
import HiringTrendsCard from '../components/HiringTrendsCard'
import ChatWidget from '../components/ChatWidget'
import { CANDIDATES } from '../data/candidates'
import { useAuth } from '../hooks/useAuth'
import '../dashboard.css'

const STATS = [
  {
    label: 'Total candidats',
    value: '1 284',
    trend: '+12% depuis le mois dernier',
    trendIcon: 'trending_up',
    positive: true,
  },
  {
    label: 'Offres actives',
    value: '42',
    trend: '5 publiées cette semaine',
    trendIcon: 'add_circle',
    positive: true,
  },
  {
    label: "Entretiens aujourd'hui",
    value: '8',
    trend: 'Prochain à 14h00',
    trendIcon: 'schedule',
    positive: null,
  },
  {
    label: 'Score moyen de correspondance',
    value: '78%',
    bar: 78,
  },
]

const STATUS_OPTIONS = ['Tous les statuts', 'Présélectionné', 'En entretien', 'Nouveau', 'Refusé']
const ROLE_OPTIONS   = ['Tous les rôles', 'Designer Produit', 'Ingénieur Frontend', 'Responsable Marketing']
const SORT_OPTIONS   = ['Score : décroissant', 'Score : croissant']

export default function DashboardPage() {
  const { getUser } = useAuth()
  const user = getUser()

  return (
    <AppLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} animationDelay={`${i * 65}ms`} />
        ))}
      </div>

      <FilterBar>
        <FilterSelect options={STATUS_OPTIONS} />
        <FilterSelect options={ROLE_OPTIONS} />
        <FilterSelect options={SORT_OPTIONS} />
      </FilterBar>

      <CandidateTable candidates={CANDIDATES} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
        <ImagePromoCard
          tag="Sourcing alimenté par l'IA"
          title="Trouvez votre prochain talent"
          description="Associez les candidats au profil de performance de vos meilleurs éléments. Notre moteur révèle les talents que vous auriez manqués."
          cta="Commencer le sourcing"
          imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCYCwxqlQhVxmNdujpppD6ydo9HdVvIQPJ2cNe3ptSPy6V8wxrHNbZtcq0QSNjtl4cbIV0gfRFtGxeudiBDJNcHO5LMzDfHew8sWTLea1LrtFONiT11FwSM-A00zKc-Kjbth4OSC4l5y2GoajgSixvZQsZV0snpoIAcnNhY3pavxs0md0y_GVhwCnsQzmXBUP9XEE8pwSIDvaTyOhSAVp_VZwnd1QaCL7bYpUFvgfeGTR6rcjXehNX-HFeZnlX72sE20HykgQX8oaqw"
          imageAlt="Une équipe de recruteurs collaborant dans un bureau moderne et lumineux"
        />
        <HiringTrendsCard />
      </div>

      {user?.id && <ChatWidget userId={user.id} />}
    </AppLayout>
  )
}
