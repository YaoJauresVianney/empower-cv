import PrimaryButton from './PrimaryButton'

export default function PageHeader({ title, subtitle, cta }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-bold text-on-surface leading-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {cta && (
        <PrimaryButton icon={cta.icon} onClick={cta.onClick}>
          {cta.label}
        </PrimaryButton>
      )}
    </div>
  )
}
