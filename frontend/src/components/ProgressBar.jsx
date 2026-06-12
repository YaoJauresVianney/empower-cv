export default function ProgressBar({ value, className = 'w-full', duration = 500 }) {
  return (
    <div className={`${className} bg-surface-purple rounded-full h-2 overflow-hidden`}>
      <div
        className="bg-primary h-2 rounded-full progress-bar-fill"
        style={{ width: `${value}%`, '--progress-duration': `${duration}ms` }}
      />
    </div>
  )
}
