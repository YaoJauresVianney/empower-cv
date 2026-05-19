import { useEffect } from 'react'
import logo from '../assets/logo.png'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', active: true },
  { icon: 'group', label: 'Candidates' },
  { icon: 'work', label: 'Jobs' },
  { icon: 'calendar_month', label: 'Interviews' },
  { icon: 'analytics', label: 'Analytics' },
]

export default function Sidebar({ onLogout, open, onClose }) {
  const bottomActions = [
    { icon: 'settings', label: 'Settings' },
    { icon: 'help', label: 'Support' },
    { icon: 'logout', label: 'Sign out', action: onLogout },
  ]

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop — mobile/tablet only */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar-grain fixed left-0 top-0 bottom-0 flex flex-col p-4 z-50 w-64 h-screen overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
        style={{
          background: '#0c0015',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
      <div className="mb-8 px-3 pt-2 flex items-center justify-between">
        <img src={logo} alt="Empower" className="h-8 w-auto" />
        <button
          className="lg:hidden p-1.5 rounded-lg transition-colors duration-150"
          style={{ color: '#6b4f7a' }}
          onClick={onClose}
          aria-label="Close menu"
          onMouseEnter={(e) => { e.currentTarget.style.color = '#efb0ff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#6b4f7a'; e.currentTarget.style.background = '' }}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <nav className="flex-grow space-y-0.5">
        {NAV_ITEMS.map(({ icon, label, active }) => (
          <a
            key={label}
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97]"
            style={
              active
                ? {
                    background: 'rgba(239,176,255,0.1)',
                    color: '#efb0ff',
                    borderLeft: '2px solid #efb0ff',
                    paddingLeft: '10px',
                  }
                : {
                    color: '#9c8fa0',
                    borderLeft: '2px solid transparent',
                    paddingLeft: '10px',
                  }
            }
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.background = ''
            }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ color: active ? '#efb0ff' : '#6b4f7a' }}
            >
              {icon}
            </span>
            {label}
          </a>
        ))}
      </nav>

      <div
        className="mt-auto space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}
      >
        <button
          className="w-full mb-4 font-bold py-2.5 px-4 rounded-xl text-[13px] text-white flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(160deg, #6b0090, #4f0067)',
            boxShadow: '0 4px 18px rgba(79,0,103,0.45)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(79,0,103,0.65)')}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 18px rgba(79,0,103,0.45)')}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Post new job
        </button>

        {bottomActions.map(({ icon, label, action }) => (
          <a
            key={label}
            href="#"
            onClick={action ? (e) => { e.preventDefault(); action() } : undefined}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150"
            style={{ color: '#6b4f7a', borderLeft: '2px solid transparent', paddingLeft: '10px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = '#c4a8d0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ''
              e.currentTarget.style.color = '#6b4f7a'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            {label}
          </a>
        ))}
      </div>
    </aside>
    </>
  )
}
