import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { getUser, logout } = useAuth()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="page-layout">
      <section className="card">
        <h1>Dashboard</h1>
        <p>
          Bienvenue {user?.name ?? user?.email ?? 'utilisateur'} sur votre espace
          de gestion candidats.
        </p>
        <button type="button" onClick={handleLogout}>
          Se déconnecter
        </button>
      </section>
    </main>
  )
}

export default DashboardPage
