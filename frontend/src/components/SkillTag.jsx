import { memo } from 'react'

const VARIANTS = {
  required: {
    className: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap',
    style: { background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' },
    dot: 'var(--color-primary)',
  },
  optional: {
    className: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap',
    style: { background: 'transparent', color: 'var(--color-outline)', border: '1px solid var(--color-outline-variant)' },
    dot: 'var(--color-outline)',
  },
}

const SkillTag = memo(function SkillTag({ skill, variant = 'required' }) {
  const v = VARIANTS[variant] ?? VARIANTS.required
  return (
    <span className={v.className} style={v.style}>
      {skill}
    </span>
  )
})

export default SkillTag
