import { memo } from 'react'

const SkillTag = memo(function SkillTag({ skill }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap"
      style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}
    >
      {skill}
    </span>
  )
})

export default SkillTag
