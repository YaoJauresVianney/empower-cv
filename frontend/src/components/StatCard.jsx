import ProgressBar from './ProgressBar'

export default function StatCard({ label, value, bar, trend, trendIcon, positive, animationDelay }) {
  return (
    <div
      className="animate-in rounded-xl p-5 bg-white"
      style={{
        animationDelay,
        boxShadow: '0 2px 14px rgba(79,0,103,0.07)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-3 text-text-muted">
        {label}
      </p>
      <p
        className="text-[38px] font-bold leading-none tracking-[-0.02em] tabular-nums mb-3"
        style={{ color: '#4f0067', fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {bar !== undefined ? (
        <div>
          <ProgressBar value={bar} duration={700} />
          <p className="text-[11px] mt-1.5 text-text-muted">
            Basé sur {bar} profils évalués
          </p>
        </div>
      ) : (
        <div
          className="flex items-center gap-1.5 text-[12px] font-medium"
          style={{ color: positive ? '#16a34a' : '#817282' }}
        >
          <span className="material-symbols-outlined text-[14px]">{trendIcon}</span>
          {trend}
        </div>
      )}
    </div>
  )
}
