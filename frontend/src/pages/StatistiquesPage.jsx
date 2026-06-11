import { useQuery } from '@tanstack/react-query'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import HorizontalBarChart from '../components/charts/HorizontalBarChart'
import VerticalBarChart from '../components/charts/VerticalBarChart'
import DonutChart from '../components/charts/DonutChart'
import { CHART_PRIMARY, formatNumberFr } from '../components/charts/chartTheme'
import { getStats } from '../services/api'
import '../dashboard.css'

function Skel({ h }) {
  return <div className="animate-pulse rounded-lg bg-[#ede4ef]" style={{ height: h }} />
}

function StatsError({ onRetry }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-purple-sm flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-[32px] text-error">error</span>
      <p className="text-[14px] text-[#4f4351]">
        Impossible de charger les statistiques. Vérifiez votre connexion puis réessayez.
      </p>
      <button
        onClick={onRetry}
        className="mt-1 px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors duration-150"
        style={{ background: CHART_PRIMARY }}
      >
        Réessayer
      </button>
    </div>
  )
}

export default function StatistiquesPage() {
  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => getStats().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  })

  const c = stats?.candidates
  const j = stats?.jobs
  const m = stats?.matching

  const kpis = [
    {
      label:     'Total candidats',
      value:     formatNumberFr(c?.total),
      trend:     c?.with_cv != null ? `${formatNumberFr(c.with_cv)} avec un CV` : '—',
      trendIcon: 'group',
      positive:  true,
    },
    {
      label:     'CVs analysés',
      value:     formatNumberFr(c?.parsed),
      trend:     c?.cv_completion_pct != null ? `${c.cv_completion_pct}% de complétion` : '—',
      trendIcon: 'description',
      positive:  true,
    },
    {
      label: 'Score moyen matching',
      value: m?.avg_score != null ? `${m.avg_score}%` : '—',
      bar:   m?.avg_score ?? undefined,
    },
    {
      label:     'Shortlists générées',
      value:     formatNumberFr(m?.shortlists_count),
      trend:     m?.quota != null ? `${m.quota.remaining} génération(s) restante(s)` : '—',
      trendIcon: 'playlist_add_check',
      positive:  true,
    },
  ]

  const jobReadinessPct = j?.total > 0
    ? Math.round((j.parsed / j.total) * 100)
    : 0

  return (
    <AppLayout>
      <PageHeader
        title="Statistiques"
        subtitle="Vue d'ensemble de vos candidats, offres et performances de matching"
      />

      {isError ? (
        <StatsError onRetry={refetch} />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skel key={i} h={130} />)
              : kpis.map((k, i) => (
                  <StatCard key={k.label} {...k} animationDelay={`${i * 65}ms`} />
                ))}
          </div>

          {/* Rôles + Expérience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SectionCard title="Top 10 postes" icon="work_history">
              {isLoading ? <Skel h={300} /> : <HorizontalBarChart data={c?.by_role} />}
            </SectionCard>
            <SectionCard title="Répartition par expérience" icon="trending_up">
              {isLoading ? <Skel h={180} /> : <VerticalBarChart data={c?.by_experience} />}
            </SectionCard>
          </div>

          {/* Secteurs + Localisations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SectionCard title="Répartition par secteur" icon="category">
              {isLoading ? <Skel h={260} /> : <DonutChart data={c?.by_sector} unit="candidats" />}
            </SectionCard>
            <SectionCard title="Top 10 localisations" icon="location_on">
              {isLoading ? <Skel h={300} /> : <HorizontalBarChart data={c?.by_location} />}
            </SectionCard>
          </div>

          {/* Compétences + Langues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SectionCard title="Top 15 compétences" icon="psychology">
              {isLoading ? <Skel h={440} /> : <HorizontalBarChart data={c?.by_skill} />}
            </SectionCard>
            <SectionCard title="Top langues parlées" icon="translate">
              {isLoading ? <Skel h={300} /> : <HorizontalBarChart data={c?.by_language} />}
            </SectionCard>
          </div>

          {/* Offres + Distribution des scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
            <SectionCard title="Offres d'emploi" icon="work">
              {isLoading ? (
                <Skel h={110} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#ede4ef]">
                    <span className="text-[13px] text-[#4f4351]">Total offres publiées</span>
                    <span
                      className="text-[20px] font-bold tabular-nums"
                      style={{ color: CHART_PRIMARY }}
                    >
                      {formatNumberFr(j?.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-[#4f4351]">Prêtes pour le matching</span>
                    <span
                      className="text-[20px] font-bold tabular-nums"
                      style={{ color: CHART_PRIMARY }}
                    >
                      {formatNumberFr(j?.parsed)}
                    </span>
                  </div>
                  {j?.total > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
                        <span>Taux de préparation</span>
                        <span className="font-semibold">{jobReadinessPct}%</span>
                      </div>
                      <div className="w-full bg-[#ede4ef] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${jobReadinessPct}%`, background: CHART_PRIMARY }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Distribution des scores de matching" icon="leaderboard">
              {isLoading ? (
                <Skel h={180} />
              ) : (
                <VerticalBarChart data={m?.score_distribution} color="#710193" />
              )}
            </SectionCard>
          </div>
        </>
      )}
    </AppLayout>
  )
}
