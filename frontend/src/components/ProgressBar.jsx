export default function ProgressBar({ value, className = 'w-full', duration = 500 }) {
  return (
    <div className={`${className} bg-[#ede4ef] rounded-full h-2 overflow-hidden`}>
      <div
        className="bg-[#4f0067] h-2 rounded-full"
        style={{
          width: `${value}%`,
          transition: `width ${duration}ms`,
        }}
      />
    </div>
  )
}
