import { useState } from 'react'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SearchInput from '../components/SearchInput'
import FilterSelect from '../components/FilterSelect'
import StatCard from '../components/StatCard'
import CandidateTable from '../components/CandidateTable'

import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../hooks/useAuth'
import { CANDIDATES } from '../data/candidates'
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
    label: 'Nouveaux cette semaine',
    value: '47',
    trend: '+8 vs semaine précédente',
    trendIcon: 'person_add',
    positive: true,
  },
  {
    label: 'En entretien',
    value: '23',
    trend: "5 entretiens aujourd'hui",
    trendIcon: 'schedule',
    positive: null,
  },
  {
    label: 'Taux de présélection',
    value: '34%',
    bar: 34,
  },
]

const STATUS_OPTIONS = ['Tous les statuts', 'Présélectionné', 'En entretien', 'Nouveau', 'Refusé']
const ROLE_OPTIONS   = ['Tous les rôles', 'Designer Produit', 'Ingénieur Frontend', 'Responsable Marketing', 'Data Engineer']
const SORT_OPTIONS   = ['Score : décroissant', 'Score : croissant', 'Date : récent', 'Date : ancien']

export default function CandidatesPage() {
   const { getUser } = useAuth()
    const user = getUser()
  const [search, setSearch] = useState('')

  const filtered = CANDIDATES.filter((c) =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <PageHeader
        title="Candidats"
        subtitle="Gérez et suivez tous vos candidats"
        cta={{ label: 'Ajouter un candidat', icon: 'person_add' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} animationDelay={`${i * 65}ms`} />
        ))}
      </div>

      <FilterBar>
        <SearchInput
          placeholder="Rechercher un candidat…"
          value={search}
          onChange={setSearch}
        />
        <FilterSelect options={STATUS_OPTIONS} />
        <FilterSelect options={ROLE_OPTIONS} />
        <FilterSelect options={SORT_OPTIONS} />
      </FilterBar>

      <CandidateTable candidates={filtered} />

      {user?.id && <ChatWidget userId={user.id} />}
    </AppLayout>
  )
}
