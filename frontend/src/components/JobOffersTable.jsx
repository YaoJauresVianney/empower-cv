import JobOfferRow from './JobOfferRow'

const TABLE_COLUMNS = [
  { id: 'offer',       label: 'Offre',               cls: '' },
  { id: 'skills',      label: 'Compétences clés',    cls: '' },
  { id: 'candidates',  label: 'Candidatures',        cls: 'text-center' },
  { id: 'published',   label: 'Publiée le',          cls: '' },
  { id: 'file',        label: 'Fichier',             cls: 'text-center' },
  { id: 'actions',     label: '',                    cls: '' },
]

const NAV_BTN_CLS = `p-3 rounded-lg text-outline border border-outline-variant/80 hover:bg-primary-fixed
  transition-colors duration-150 active:scale-[0.94]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim
  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100`

function SkeletonRow() {
  return (
    <tr className="border-b border-outline-variant/30 last:border-0">
      {TABLE_COLUMNS.map(({ id }) => (
        <td key={id} className="px-6 py-4">
          <div className="h-4 rounded-md bg-surface-container animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={TABLE_COLUMNS.length} className="px-6 py-16 text-center">
        <span className="material-symbols-outlined text-[40px] text-text-muted block mb-3">
          work_off
        </span>
        <p className="text-[14px] font-semibold text-on-surface">Aucune offre trouvée</p>
        <p className="text-[13px] text-text-muted mt-1">
          Ajustez vos filtres ou publiez une nouvelle offre.
        </p>
      </td>
    </tr>
  )
}

function buildPaginationLabel(visibleCount, totalCount) {
  if (visibleCount === 0) return 'Aucune offre à afficher'
  return `Affichage 1–${visibleCount} sur ${totalCount} offres`
}

export default function JobOffersTable({ offers = [], totalCount = 0, loading = false, onOfferUpdate }) {
  const isEmpty = !loading && offers.length === 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-purple-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table
          className="w-full text-left border-collapse"
          aria-label="Liste des offres d'emploi"
        >
          <thead>
            <tr className="border-b border-outline-variant/50">
              {TABLE_COLUMNS.map(({ id, label, cls }) => (
                <th
                  key={id}
                  scope="col"
                  className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} />)
              : isEmpty
                ? <EmptyState />
                : offers.map((offer) => <JobOfferRow key={offer.id} offer={offer} onOfferUpdate={onOfferUpdate} />)
            }
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-3.5 border-t border-outline-variant/40">
        <p className="text-[12px] font-medium text-text-muted">
          {buildPaginationLabel(offers.length, totalCount)}
        </p>

        <div className="flex items-center gap-1.5">
          <button className={NAV_BTN_CLS} aria-label="Page précédente" disabled={isEmpty}>
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <button
            className="w-11 h-11 rounded-lg text-[13px] font-bold text-on-primary bg-primary
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed-dim focus-visible:ring-offset-2"
            aria-label="Page 1"
            aria-current="page"
          >
            1
          </button>

          <button className={NAV_BTN_CLS} aria-label="Page suivante" disabled={isEmpty}>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
