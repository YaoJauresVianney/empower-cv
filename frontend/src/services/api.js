import axios from 'axios'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const api = axios.create({
  baseURL: 'http://empower-cv-api.test/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
    }

    return Promise.reject(error)
  },
)

export const setAuthToken = (token) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }

  localStorage.setItem(TOKEN_KEY, token)
}

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const setAuthUser = (user) => {
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getAuthUser = () => {
  const value = localStorage.getItem(USER_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const getJobOffers = () => api.get('api/jobs')

export const getCandidates = (page = 1, search = '', signal = null) =>
  api.get('api/candidates', { params: { page, search }, signal })

export const parseCandidateCv = (id) =>
  api.post(`api/candidates/${id}/parse-cv`)

export default api
