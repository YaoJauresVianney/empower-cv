import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

function ScoreBadge({ score }) {
  const [color, bg] =
    score >= 85 ? ['#16a34a', '#dcfce7'] :
    score >= 70 ? ['#4f0067', '#f3e8f9'] :
    score >= 50 ? ['#d97706', '#fef3c7'] :
                  ['#6b7280', '#f3f4f6']
  return (
    <span
      className="text-[12px] font-bold tabular-nums px-2 py-0.5 rounded-lg flex-shrink-0"
      style={{ color, background: bg }}
    >
      {score}%
    </span>
  )
}

function SkeletonRow() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3 w-40 rounded bg-surface-container animate-pulse" />
        <div className="h-5 w-10 rounded-lg bg-surface-container animate-pulse" />
      </div>
      <div className="h-2 w-full rounded-full bg-surface-container animate-pulse" />
    </div>
  )
}

export default function TopMatchingJobsCard({ jobs = [], isLoading = false }) {
  return (
    <div
      className="bg-white p-8 rounded-2xl flex flex-col"
      style={{ boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[18px]" style={{ color: '#4f0067' }}>
          emoji_events
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
          Matching
        </p>
      </div>
      <h4 className="text-[22px] font-bold tracking-tight leading-snug mb-1" style={{ color: '#1b1b1b' }}>
        Top offres en matching
      </h4>
      <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#817282' }}>
        Les 5 offres ayant le meilleur score moyen sur leurs shortlists complétées.
      </p>

      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <span className="material-symbols-outlined text-[32px] text-outline/50">leaderboard</span>
          <p className="text-[13px] text-text-muted text-center">
            Aucune donnée disponible.<br />Générez des shortlists pour voir apparaître le classement.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {jobs.map((job, i) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block group"
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <span
                  className="text-[13px] font-medium truncate group-hover:text-primary transition-colors duration-150"
                  style={{ color: '#4f4351' }}
                >
                  <span className="font-bold mr-1.5" style={{ color: '#4f0067' }}>#{i + 1}</span>
                  {job.title}
                </span>
                <ScoreBadge score={job.avg_score} />
              </div>
              <ProgressBar value={job.avg_score} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
