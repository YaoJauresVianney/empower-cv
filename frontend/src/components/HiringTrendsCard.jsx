import ProgressBar from './ProgressBar'

const PHASES = [
  { label: 'Phase de présélection', value: '3,2 jours', pct: 65 },
  { label: "Phase d'entretien", value: '5,8 jours', pct: 40 },
]

export default function HiringTrendsCard() {
  return (
    <div
      className="bg-white p-8 rounded-2xl flex flex-col justify-between"
      style={{ boxShadow: '0 2px 14px rgba(79,0,103,0.07)' }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[18px]" style={{ color: '#4f0067' }}>
            show_chart
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
            Vitesse de recrutement
          </p>
        </div>
        <h4 className="text-[22px] font-bold tracking-tight leading-snug mb-3" style={{ color: '#1b1b1b' }}>
          Tendances de recrutement
        </h4>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#817282' }}>
          Le délai de recrutement a baissé de 14% depuis le nouveau protocole de présélection du mois dernier. La présélection est le principal facteur.
        </p>

        <div className="space-y-5">
          {PHASES.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium" style={{ color: '#4f4351' }}>
                  {item.label}
                </span>
                <span
                  className="text-[13px] font-bold tabular-nums"
                  style={{ color: '#4f0067', fontVariantNumeric: 'tabular-nums' }}
                >
                  {item.value}
                </span>
              </div>
              <ProgressBar value={item.pct} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="mt-8 flex items-center gap-1.5 text-[13px] font-bold transition-all duration-150 w-fit"
        style={{ color: '#4f0067' }}
        onMouseEnter={(e) => (e.currentTarget.style.gap = '8px')}
        onMouseLeave={(e) => (e.currentTarget.style.gap = '6px')}
      >
        Voir le rapport complet
        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  )
}
