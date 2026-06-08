import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SearchInput from '../components/SearchInput'
import FilterSelect from '../components/FilterSelect'
import MultiSelect from '../components/MultiSelect'
import StatCard from '../components/StatCard'
import CandidateTable from '../components/CandidateTable'

import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../hooks/useAuth'
import { getCandidates, getCandidateStats, getCandidateRoles, getCandidateLocations, getCandidateSectors, getCandidateJobTypes, getCandidateLanguages, getCandidateSkills } from '../services/api'
import '../dashboard.css'

const STATIC_STATS = [
  {
    label: 'Nouveaux cette semaine',
    value: '47',
    trend: '+8 vs semaine précédente',
    trendIcon: 'person_add',
    positive: true,
  },
]

const CV_OPTIONS = [
  { label: 'Tous les CVs', value: '' },
  { label: 'Avec CV',      value: 'with' },
  { label: 'Sans CV',      value: 'without' },
]

const PARSE_STATUS_OPTIONS = [
  { label: 'Tous les statuts', value: '' },
  { label: 'Analysé',          value: 'completed' },
  { label: 'En cours',         value: 'in_progress' },
  { label: 'Échec',            value: 'failed' },
  { label: 'Non lancé',        value: 'none' },
]

const EXPERIENCE_OPTIONS = [
  { label: "Toute expérience", value: '' },
  { label: '0 – 2 ans',        value: '0-2' },
  { label: '3 – 5 ans',        value: '3-5' },
  { label: '6 – 10 ans',       value: '6-10' },
  { label: '10+ ans',          value: '10+' },
]

const SORT_OPTIONS = [
  { label: 'Plus récent', value: 'recent' },
  { label: 'Plus ancien', value: 'oldest' },
  { label: 'Nom A→Z',     value: 'name_asc' },
  { label: 'Nom Z→A',     value: 'name_desc' },
]

export default function CandidatesPage() {
  const { getUser } = useAuth()
  const user = getUser()
  const queryClient = useQueryClient()

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [search, setSearch]             = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [page, setPage]                 = useState(1)
  const [cv, setCv]                     = useState('')
  const [parseStatus, setParseStatus]   = useState('')
  const [role, setRole]                 = useState([])
  const [sort, setSort]                 = useState('recent')
  const [experience, setExperience]     = useState('')
  const [location, setLocation]         = useState([])
  const [sector, setSector]             = useState('')
  const [jobType, setJobType]           = useState('')
  const [language, setLanguage]         = useState([])
  const [skill, setSkill]               = useState([])

  // Stable string keys for array filters — avoids new references on every render
  const roleKey     = role.join('|')
  const locationKey = location.join('|')
  const languageKey = language.join('|')
  const skillKey    = skill.join('|')

  // Static data — fetched once, never stale
  const { data: cvStats } = useQuery({
    queryKey: ['candidateStats'],
    queryFn: () => getCandidateStats().then(res => res.data),
    staleTime: Infinity,
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['candidateRoles'],
    queryFn: () => getCandidateRoles().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  const { data: locations = [] } = useQuery({
    queryKey: ['candidateLocations'],
    queryFn: () => getCandidateLocations().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  const { data: sectors = [] } = useQuery({
    queryKey: ['candidateSectors'],
    queryFn: () => getCandidateSectors().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  const { data: jobTypes = [] } = useQuery({
    queryKey: ['candidateJobTypes'],
    queryFn: () => getCandidateJobTypes().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  const { data: languages = [] } = useQuery({
    queryKey: ['candidateLanguages'],
    queryFn: () => getCandidateLanguages().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  const { data: skills = [] } = useQuery({
    queryKey: ['candidateSkills'],
    queryFn: () => getCandidateSkills().then(res => res.data?.data ?? []),
    staleTime: Infinity,
  })

  // Main candidates query — signal injected automatically by React Query (replaces AbortController)
  const { data: candidatesData, isLoading, isError } = useQuery({
    queryKey: ['candidates', page, debouncedSearch, cv, parseStatus, roleKey, sort, experience, locationKey, sector, jobType, languageKey, skillKey],
    queryFn: ({ signal }) => getCandidates(
      page, debouncedSearch,
      { cv, parse_status: parseStatus, role, sort, experience, location, sector, job_type: jobType, language, skill },
      signal
    ).then(res => ({ candidates: res.data?.data ?? [], meta: res.data?.meta ?? null })),
    placeholderData: keepPreviousData,
  })

  const candidates = candidatesData?.candidates ?? []
  const meta       = candidatesData?.meta ?? null

  // Debounce search — timer is an external system, setState in callback is fine
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const sectorOptions = [
    { label: 'Tous les secteurs', value: '' },
    ...sectors.map((s) => ({ label: s, value: s })),
  ]

  const jobTypeOptions = [
    { label: 'Tous les contrats', value: '' },
    ...jobTypes.map((j) => ({ label: j, value: j })),
  ]

  const handleCv          = (v) => { setCv(v);          setPage(1) }
  const handleParseStatus = (v) => { setParseStatus(v); setPage(1) }
  const handleRole        = (v) => { setRole(v);        setPage(1) }
  const handleSort        = (v) => { setSort(v);        setPage(1) }
  const handleExperience  = (v) => { setExperience(v);  setPage(1) }
  const handleLocation    = (v) => { setLocation(v);    setPage(1) }
  const handleSector      = (v) => { setSector(v);      setPage(1) }
  const handleJobType     = (v) => { setJobType(v);     setPage(1) }
  const handleLanguage    = (v) => { setLanguage(v);    setPage(1) }
  const handleSkill       = (v) => { setSkill(v);       setPage(1) }

  const handleCandidateUpdate = useCallback((id, patch) => {
    queryClient.setQueriesData(
      { queryKey: ['candidates'] },
      (old) => old ? { ...old, candidates: old.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)) } : old
    )
  }, [queryClient])

  return (
    <AppLayout>
      <PageHeader
        title="Candidats"
        subtitle="Gérez et suivez tous vos candidats"
        cta={{ label: 'Ajouter un candidat', icon: 'person_add' }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total candidats"
          value={cvStats ? cvStats.total.toLocaleString('fr-FR') : '—'}
          trend="+12% depuis le mois dernier"
          trendIcon="trending_up"
          positive={true}
          animationDelay="0ms"
        />
        {STATIC_STATS.map((stat, i) => (
          <StatCard key={stat.label} {...stat} animationDelay={`${(i + 1) * 65}ms`} />
        ))}
        <StatCard
          label="Complétion CV"
          value={cvStats ? `${cvStats.cv_completion_pct}%` : '—'}
          bar={cvStats?.cv_completion_pct}
          animationDelay="130ms"
        />
        <StatCard
          label="CVs analysés par l'IA"
          value={cvStats ? `${cvStats.parsed.toLocaleString('fr-FR')} / ${cvStats.with_cv.toLocaleString('fr-FR')}` : '—'}
          trend={cvStats ? `${cvStats.pending} en attente de traitement` : ''}
          trendIcon="auto_awesome"
          positive={null}
          animationDelay="195ms"
        />
      </div>

      <FilterBar onAdvancedFilters={() => setShowAdvanced((v) => !v)}>
        <SearchInput
          placeholder="Rechercher un candidat…"
          value={search}
          onChange={setSearch}
        />
        <FilterSelect options={CV_OPTIONS}           value={cv}          onChange={handleCv} />
        <FilterSelect options={PARSE_STATUS_OPTIONS} value={parseStatus} onChange={handleParseStatus} />
        <MultiSelect
          options={roles}
          value={role}
          onChange={handleRole}
          placeholder="Rôles"
          searchPlaceholder="Rechercher un rôle…"
        />
        <FilterSelect options={SORT_OPTIONS}         value={sort}        onChange={handleSort} />
      </FilterBar>

      {showAdvanced && (
        <div
          className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-xl px-4 py-3"
          style={{ boxShadow: '0 1px 6px rgba(79,0,103,0.05)' }}
        >
          <FilterSelect options={EXPERIENCE_OPTIONS} value={experience} onChange={handleExperience} />
          <MultiSelect
            options={locations}
            value={location}
            onChange={handleLocation}
            placeholder="Villes"
            searchPlaceholder="Rechercher une ville…"
          />
          <FilterSelect options={sectorOptions}      value={sector}     onChange={handleSector} />
          <FilterSelect options={jobTypeOptions}     value={jobType}    onChange={handleJobType} />
          <MultiSelect
            options={languages}
            value={language}
            onChange={handleLanguage}
            placeholder="Langues"
            searchPlaceholder="Rechercher une langue…"
          />
          <MultiSelect
            options={skills}
            value={skill}
            onChange={handleSkill}
            placeholder="Compétences"
            searchPlaceholder="Rechercher une compétence…"
          />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500 mb-4">Impossible de charger les candidats.</p>
      )}

      <CandidateTable
        candidates={isLoading ? [] : candidates}
        meta={meta}
        onPageChange={setPage}
        onCandidateUpdate={handleCandidateUpdate}
      />

      {user?.id && <ChatWidget userId={user.id} />}
    </AppLayout>
  )
}
