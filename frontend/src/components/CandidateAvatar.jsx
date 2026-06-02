const SIZES = {
  sm: {
    wrapper: 'w-9 h-9 rounded-lg border border-outline-variant/60',
    text:    'text-[13px]',
    imgCls:  'transition-transform duration-200 group-hover:scale-110',
    style:   {},
    lazy:    true,
  },
  lg: {
    wrapper: 'w-[72px] h-[72px] rounded-2xl',
    text:    'text-[28px]',
    imgCls:  '',
    style:   { border: '2px solid var(--color-primary-fixed-dim)' },
    lazy:    false,
  },
}

const handleError = (e) => { e.currentTarget.style.display = 'none' }

export default function CandidateAvatar({ name, avatar, size = 'sm' }) {
  const cfg     = SIZES[size] ?? SIZES.sm
  const initial = (name ?? '').charAt(0).toUpperCase() || '?'

  return (
    <div
      className={`${cfg.wrapper} overflow-hidden flex-shrink-0 flex items-center justify-center bg-primary-fixed`}
      style={cfg.style}
    >
      {avatar
        ? <img
            src={avatar}
            alt={name}
            className={`w-full h-full object-cover ${cfg.imgCls}`}
            loading={cfg.lazy ? 'lazy' : undefined}
            onError={cfg.lazy ? handleError : undefined}
          />
        : <span className={`${cfg.text} font-bold text-primary select-none`}>{initial}</span>
      }
    </div>
  )
}
