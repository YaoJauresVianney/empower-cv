import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/LoginForm'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, saveToken, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async ({ email, password }) => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('api/login', { email, password })
      const token = data?.token ?? data?.access_token ?? ''
      const user = data?.user ?? null

      if (!token) {
        setError('Token non reçu depuis le serveur.')
        return
      }

      saveToken(token)
      setUser(user)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      if (requestError?.response?.status === 429) {
        const retry = Number(requestError.response.headers?.['retry-after'])
        setError(
          retry > 0
            ? `Trop de tentatives. Réessayez dans ${retry} seconde${retry > 1 ? 's' : ''}.`
            : 'Trop de tentatives de connexion. Réessayez dans quelques instants.',
        )
      } else {
        setError(
          requestError?.response?.data?.message ??
            'Impossible de se connecter pour le moment.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
}

export default LoginPage
