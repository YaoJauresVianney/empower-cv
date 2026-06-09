const PRIMARY_COLOR = '#4f0067'

export default function ScoreRing({ score }) {
  const radius        = 36
  const circumference = 2 * Math.PI * radius
  const strokeOffset  = circumference * (1 - (score ?? 0) / 100)

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className="relative w-[88px] h-[88px]">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#fad7ff" strokeWidth="7" />
          <circle
            cx="44" cy="44" r={radius} fill="none"
            stroke={PRIMARY_COLOR} strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[19px] font-bold tabular-nums" style={{ color: PRIMARY_COLOR }}>
            {score != null ? score : '—'}
          </span>
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">Score</p>
    </div>
  )
}
