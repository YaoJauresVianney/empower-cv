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

export const getJobOffer = (id) => api.get(`api/jobs/${id}`)

export const getJobShortlists = (id) => api.get(`api/jobs/${id}/shortlists`)

export const getShortlistStatus = (id) => api.get(`api/shortlists/${id}/status`)

export const getCandidates = (page = 1, search = '', filters = {}, signal = null) => {
  const params = { page, search }

  for (const [key, val] of Object.entries(filters)) {
    if (Array.isArray(val)) {
      if (val.length) params[key] = val // serialized as key[]=a&key[]=b
    } else if (val !== '' && val != null) {
      params[key] = val
    }
  }

  return api.get('api/candidates', { params, signal })
}

export const getCandidateStats = () => api.get('api/candidates/stats')

export const getCandidateRoles     = () => api.get('api/candidates/roles')
export const getCandidateLocations = () => api.get('api/candidates/locations')
export const getCandidateSectors   = () => api.get('api/candidates/sectors')
export const getCandidateJobTypes  = () => api.get('api/candidates/job-types')
export const getCandidateLanguages = () => api.get('api/candidates/languages')
export const getCandidateSkills    = () => api.get('api/candidates/skills')

export const getCandidate = (id) =>
  api.get(`api/candidates/${id}`)

export const parseCandidateCv = (id) =>
  api.post(`api/candidates/${id}/parse-cv`)

export const getCandidateParseStatus = (id) =>
  api.get(`api/candidates/${id}/parse-status`)

export default api
