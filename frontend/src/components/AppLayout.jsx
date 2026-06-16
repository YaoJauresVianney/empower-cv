import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import UploadJobDescription from './UploadJobDescription'

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const { getUser, logout } = useAuth()
  const user = getUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className="overflow-x-hidden min-h-[100dvh]" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <Sidebar
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onPublish={() => setPublishOpen(true)}
        />
        <main className="lg:ml-64 min-h-[100dvh]">
          <TopBar user={user} onMenuToggle={() => setSidebarOpen(true)} />
          <div className="p-6 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {publishOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setPublishOpen(false) }}
        >
          <UploadJobDescription
            onUploadSuccess={(id) => { setPublishOpen(false); navigate(`/jobs/${id}`) }}
            onCancel={() => setPublishOpen(false)}
          />
        </div>
      )}
    </>
  )
}
