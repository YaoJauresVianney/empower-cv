const PRIMARY_COLOR = '#4f0067'

export default function TagList({ items, empty = 'Aucune donnée.' }) {
  if (!items?.length) return <p className="text-[13px] text-text-muted py-1">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-primary-fixed"
          style={{ color: PRIMARY_COLOR }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
