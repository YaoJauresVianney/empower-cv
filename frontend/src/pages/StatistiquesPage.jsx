import { useQuery } from '@tanstack/react-query'
import AppLayout from '../components/AppLayout'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import HorizontalBarChart from '../components/charts/HorizontalBarChart'
import VerticalBarChart from '../components/charts/VerticalBarChart'
import DonutChart from '../components/charts/DonutChart'
import { formatNumberFr, CHART_PALETTE } from '../components/charts/chartTheme'
import { getStats } from '../services/api'
import '../dashboard.css'

function Skel({ h }) {
  return <div aria-hidden="true" className="animate-pulse rounded-lg bg-surface-purple" style={{ height: h }} />
}

function StatsError({ onRetry }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-purple-sm flex flex-col items-center gap-3">
      <span className="material-symbols-outlined text-[32px] text-error">error</span>
      <p className="text-[14px] text-on-surface-variant">
        Impossible de charger les statistiques. Vérifiez votre connexion puis réessayez.
      </p>
      <button
        onClick={onRetry}
        className="mt-1 px-4 min-h-[44px] rounded-lg text-[13px] font-semibold text-white bg-primary transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

      <div role="status" aria-live="polite" className="sr-only">
        {isLoading ? 'Chargement des statistiques…' : isError ? 'Erreur lors du chargement des statistiques.' : 'Statistiques chargées.'}
      </div>

      {isError ? (
        <StatsError onRetry={refetch} />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" aria-busy={isLoading} aria-label="Indicateurs clés">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skel key={i} h={130} />)
              : kpis.map((k, i) => (
                  <StatCard key={k.label} {...k} animationDelay={`${i * 65}ms`} />
                ))}
          </div>

          {/* Rôles + Expérience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5" aria-busy={isLoading}>
            <SectionCard title="Top 10 postes" icon="work_history">
              {isLoading ? <Skel h={300} /> : (
                <HorizontalBarChart data={c?.by_role} ariaLabel="Top 10 des postes les plus représentés parmi les candidats" />
              )}
            </SectionCard>
            <SectionCard title="Répartition par expérience" icon="trending_up">
              {isLoading ? <Skel h={180} /> : (
                <VerticalBarChart data={c?.by_experience} ariaLabel="Répartition des candidats par niveau d'expérience" />
              )}
            </SectionCard>
          </div>

          {/* Secteurs + Localisations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5" aria-busy={isLoading}>
            <SectionCard title="Répartition par secteur" icon="category">
              {isLoading ? <Skel h={260} /> : (
                <DonutChart data={c?.by_sector} unit="candidats" ariaLabel="Répartition des candidats par secteur d'activité" />
              )}
            </SectionCard>
            <SectionCard title="Top 10 localisations" icon="location_on">
              {isLoading ? <Skel h={300} /> : (
                <HorizontalBarChart data={c?.by_location} ariaLabel="Top 10 des localisations les plus fréquentes parmi les candidats" />
              )}
            </SectionCard>
          </div>

          {/* Compétences + Langues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5" aria-busy={isLoading}>
            <SectionCard title="Top 15 compétences" icon="psychology">
              {isLoading ? <Skel h={440} /> : (
                <HorizontalBarChart data={c?.by_skill} ariaLabel="Top 15 des compétences les plus fréquentes parmi les candidats" />
              )}
            </SectionCard>
            <SectionCard title="Top langues parlées" icon="translate">
              {isLoading ? <Skel h={300} /> : (
                <HorizontalBarChart data={c?.by_language} ariaLabel="Top des langues parlées par les candidats" />
              )}
            </SectionCard>
          </div>

          {/* Offres + Distribution des scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-12" aria-busy={isLoading}>
            <SectionCard title="Offres d'emploi" icon="work">
              {isLoading ? (
                <Skel h={110} />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-surface-purple">
                    <span className="text-[13px] text-on-surface-variant">Total offres publiées</span>
                    <span className="text-[20px] font-bold tabular-nums text-primary">
                      {formatNumberFr(j?.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-on-surface-variant">Prêtes pour le matching</span>
                    <span className="text-[20px] font-bold tabular-nums text-primary">
                      {formatNumberFr(j?.parsed)}
                    </span>
                  </div>
                  {j?.total > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
                        <span>Taux de préparation</span>
                        <span className="font-semibold">{jobReadinessPct}%</span>
                      </div>
                      <div className="w-full bg-surface-purple rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary transition-[width] duration-700"
                          style={{ width: `${jobReadinessPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Distribution des scores de matching" icon="leaderboard" shadow="shadow-purple-md">
              {isLoading ? (
                <Skel h={180} />
              ) : (
                <VerticalBarChart
                  data={m?.score_distribution}
                  color={CHART_PALETTE[1]}
                  ariaLabel="Distribution des scores de matching entre candidats et offres d'emploi"
                />
              )}
            </SectionCard>
          </div>
        </>
      )}
    </AppLayout>
  )
}
