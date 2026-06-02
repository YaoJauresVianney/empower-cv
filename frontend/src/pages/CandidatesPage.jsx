import { useState, useEffect } from 'react'
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

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [search, setSearch]           = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [page, setPage]               = useState(1)
  const [candidates, setCandidates]   = useState([])
  const [meta, setMeta]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [cvStats, setCvStats]         = useState(null)
  const [cv, setCv]                   = useState('')
  const [parseStatus, setParseStatus] = useState('')
  const [role, setRole]               = useState('')
  const [sort, setSort]               = useState('recent')
  const [experience, setExperience]   = useState('')
  const [location, setLocation]       = useState([])
  const [locations, setLocations]     = useState([])
  const [sector, setSector]           = useState('')
  const [sectors, setSectors]         = useState([])
  const [jobType, setJobType]         = useState('')
  const [jobTypes, setJobTypes]       = useState([])
  const [language, setLanguage]       = useState([])
  const [languages, setLanguages]     = useState([])
  const [skill, setSkill]             = useState([])
  const [skills, setSkills]           = useState([])
  const [roles, setRoles]             = useState([])

  const roleOptions = [
    { label: 'Tous les rôles', value: '' },
    ...roles.map((r) => ({ label: r, value: r })),
  ]

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
  const handleExperience  = (v) => { setExperience(v); setPage(1) }
  const handleLocation    = (v) => { setLocation(v);   setPage(1) }
  const handleSector      = (v) => { setSector(v);     setPage(1) }
  const handleJobType     = (v) => { setJobType(v);   setPage(1) }
  const handleLanguage    = (v) => { setLanguage(v);  setPage(1) }
  const handleSkill       = (v) => { setSkill(v);     setPage(1) }

  // location / language / skill are arrays — re-run the fetch effect when their
  // contents change, not their (always-new) reference.
  const locationKey = location.join('|')
  const languageKey = language.join('|')
  const skillKey    = skill.join('|')

  useEffect(() => {
    getCandidateStats()
      .then((res) => setCvStats(res.data))
      .catch(() => {})
    getCandidateRoles()
      .then((res) => setRoles(res.data?.data ?? []))
      .catch(() => {})
    getCandidateLocations()
      .then((res) => setLocations(res.data?.data ?? []))
      .catch(() => {})
    getCandidateSectors()
      .then((res) => setSectors(res.data?.data ?? []))
      .catch(() => {})
    getCandidateJobTypes()
      .then((res) => setJobTypes(res.data?.data ?? []))
      .catch(() => {})
    getCandidateLanguages()
      .then((res) => setLanguages(res.data?.data ?? []))
      .catch(() => {})
    getCandidateSkills()
      .then((res) => setSkills(res.data?.data ?? []))
      .catch(() => {})
  }, [])

  // Debounce search — reset to page 1 on new query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  // Fetch on page or search change
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getCandidates(page, debouncedSearch, { cv, parse_status: parseStatus, role, sort, experience, location, sector, job_type: jobType, language, skill }, controller.signal)
      .then((res) => {
        setCandidates(res.data?.data ?? [])
        setMeta(res.data?.meta ?? null)
      })
      .catch((err) => {
        if (err?.code === 'ERR_CANCELED') return
        console.error('[CandidatesPage] fetch error', err?.response ?? err)
        setError('Impossible de charger les candidats.')
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, cv, parseStatus, role, sort, experience, locationKey, sector, jobType, languageKey, skillKey])

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
        <FilterSelect options={roleOptions}          value={role}        onChange={handleRole} />
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

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      <CandidateTable
        candidates={loading ? [] : candidates}
        meta={meta}
        onPageChange={setPage}
      />

      {user?.id && <ChatWidget userId={user.id} />}
    </AppLayout>
  )
}
