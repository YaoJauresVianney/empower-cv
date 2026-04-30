import {
  getAuthToken,
  getAuthUser,
  setAuthToken,
  setAuthUser,
} from '../services/api'

export const useAuth = () => {
  const isAuthenticated = () => Boolean(getAuthToken())

  const saveToken = (token) => {
    setAuthToken(token)
  }

  const setUser = (user) => {
    setAuthUser(user)
  }

  const getUser = () => getAuthUser()

  const logout = () => {
    setAuthToken('')
    setAuthUser(null)
  }

  const clearToken = () => {
    setAuthToken('')
  }

  return {
    isAuthenticated,
    saveToken,
    setUser,
    getUser,
    logout,
    clearToken,
  }
}
