export default function ImagePromoCard({ tag, title, description, cta, imageSrc, imageAlt }) {
  return (
    <div className="relative rounded-2xl overflow-hidden min-h-[260px] flex flex-col justify-end p-8 text-white group cursor-pointer">
      <img
        alt={imageAlt}
        src={imageSrc}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(12,0,21,0.92) 0%, rgba(79,0,103,0.45) 55%, transparent 100%)' }}
      />
      <div className="relative z-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#efb0ff' }}>
          {tag}
        </p>
        <h4 className="text-[22px] font-bold leading-snug tracking-tight mb-2">
          {title}
        </h4>
        <p className="text-[14px] leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          {description}
        </p>
        <button
          className="mt-5 px-5 py-2 bg-white rounded-lg font-bold text-[13px] transition-all duration-200 active:scale-[0.97]"
          style={{ color: '#4f0067' }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)')}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
