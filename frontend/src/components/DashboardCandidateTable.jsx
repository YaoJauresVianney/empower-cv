import { useNavigate } from 'react-router-dom'
import CandidateAvatar from './CandidateAvatar'

function EmptyState() {
  return (
    <tr>
      <td colSpan={3} className="px-6 py-12 text-center">
        <span className="material-symbols-outlined text-[36px] text-text-muted block mb-2">person_search</span>
        <p className="text-[14px] font-semibold text-on-surface">Aucun candidat</p>
      </td>
    </tr>
  )
}

function CandidateRow({ candidate }) {
  const navigate = useNavigate()
  const name = candidate.name ?? 'Nom inconnu'

  return (
    <tr
      onClick={() => navigate(`/candidates/${candidate.id}`)}
      className="group cursor-pointer transition-colors duration-150 hover:bg-primary-fixed/40"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <CandidateAvatar name={name} avatar={candidate.avatar} size="sm" />
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-on-surface leading-snug truncate">{name}</p>
            <p className="text-[12px] text-outline mt-0.5 truncate">{candidate.email ?? ''}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[14px] font-medium text-on-surface-variant max-w-40">
        <span className="truncate block">{candidate.role ?? '—'}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <span className="material-symbols-outlined text-[18px] text-outline opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          chevron_right
        </span>
      </td>
    </tr>
  )
}

export default function DashboardCandidateTable({ candidates = [], total = null }) {
  const displayTotal = total !== null ? total : candidates.length

  return (
    <div className="bg-white rounded-2xl shadow-purple-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50">
        <h2 className="text-[15px] font-semibold text-on-surface">Candidats récents</h2>
        {displayTotal > 0 && (
          <span className="text-[12px] font-medium text-text-muted">
            {displayTotal.toLocaleString('fr-FR')} candidats
          </span>
        )}
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" aria-label="Aperçu des candidats">
          <thead>
            <tr className="border-b border-outline-variant/50">
              {['Candidat', 'Rôle', ''].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.length === 0
              ? <EmptyState />
              : candidates.map((c) => <CandidateRow key={c.id} candidate={c} />)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
