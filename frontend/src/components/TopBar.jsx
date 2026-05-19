import { useEffect, useRef } from 'react'

const TAB_LABELS = ['All applications', 'Recent', 'Shortlisted']

export default function TopBar({ user, onMenuToggle }) {
  const headerRef = useRef(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const onScroll = () => {
      header.classList.toggle('glass-topbar', window.scrollY > 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 transition-all duration-200"
      style={{ background: '#f4f2f7', borderBottom: '1px solid rgba(211,193,210,0.5)' }}
    >
      <div className="flex items-center gap-6 flex-1">
        <button
          className="lg:hidden p-2 rounded-lg transition-colors duration-150 active:scale-[0.94]"
          style={{ color: '#817282' }}
          onClick={onMenuToggle}
          aria-label="Open menu"
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79,0,103,0.07)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>
        <div
          className="relative w-full max-w-sm rounded-lg transition-all duration-150"
          style={{ background: 'rgba(255,255,255,0.8)' }}
        >
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]"
            style={{ color: '#9c8fa0' }}
          >
            search
          </span>
          <input
            className="w-full bg-transparent rounded-lg pl-9 pr-4 py-2 text-[14px] outline-none placeholder:text-[#9c8fa0]"
            style={{ color: '#1b1b1b' }}
            placeholder="Search candidates, jobs..."
            type="text"
            onFocus={(e) => (e.currentTarget.parentElement.style.boxShadow = '0 0 0 2px rgba(79,0,103,0.25)')}
            onBlur={(e) => (e.currentTarget.parentElement.style.boxShadow = '')}
          />
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {TAB_LABELS.map((label, i) => (
            <a
              key={label}
              href="#"
              className="h-16 flex items-center text-[13px] font-semibold transition-colors duration-150"
              style={
                i === 0
                  ? { color: '#4f0067', borderBottom: '2px solid #4f0067' }
                  : { color: '#817282', borderBottom: '2px solid transparent' }
              }
              onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.color = '#4f0067' }}
              onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.color = '#817282' }}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 rounded-full transition-all duration-150 active:scale-[0.94]"
          style={{ color: '#817282' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79,0,103,0.07)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '')}
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
            style={{ background: '#ba1a1a', borderColor: '#f4f2f7' }}
          />
        </button>

        <button
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-[13px] text-white transition-all duration-200 active:scale-[0.97]"
          style={{
            background: '#4f0067',
            boxShadow: '0 2px 10px rgba(79,0,103,0.22)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3d0050'
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(79,0,103,0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#4f0067'
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(79,0,103,0.22)'
          }}
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add candidate
        </button>

        <button
          className="w-9 h-9 rounded-lg overflow-hidden border-2 transition-all duration-150 active:scale-[0.94]"
          style={{ borderColor: '#d3c1d2' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#4f0067')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d3c1d2')}
          aria-label="Profile"
        >
          <img
            alt={user?.name ?? 'HR Manager'}
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd7uRbQD4AN_IyVVxndrP66z-tR68KZA6Czdyl68_rF3n0dBmXCy2k2EAOU3K-CP9V4s-dyL5pyhOtqMMUx0Rs8K-GzdHsCT87E9K0cXH_yFuCByhx-oRyfPOwfe05l9_xXl-gBdqSnkebOIgnbBcpEtg6pIXhtwNpmkB5xgyjnLy0fsmxl97vF6JEvjAFRqi0WfIKp-Lp2QBRS9HLsidzEzY9cCagHfdl_EplW_7dHfz-vjOlNQXwy4HAtoMEo2o2uAd7HJZ2H6Zk"
          />
        </button>
      </div>
    </header>
  )
}
