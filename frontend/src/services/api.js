import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

function errorMessage(data, fallback) {
  return data?.message || data?.detail?.message || data?.detail || fallback
}

// Token missing/expired or backend rejected it (401): clear the session and
// send the user back to the login page.
async function handleSessionExpired() {
  try {
    await supabase.auth.signOut()
  } catch {
    /* ignore */
  }
  if (window.location.pathname !== '/auth') {
    window.location.assign('/auth')
  }
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const token = await getToken()
  if (!token) {
    await handleSessionExpired()
    throw new Error('Your session has expired. Please sign in again.')
  }

  const headers = { Authorization: `Bearer ${token}` }
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    await handleSessionExpired()
    throw new Error('Your session has expired. Please sign in again.')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(errorMessage(data, 'Request failed'))
  return data
}

// ── Current user ──────────────────────────────────────────────────────────────

export const getMe = () => request('/api/v1/me')

export const updateUsername = (username) =>
  request('/api/v1/me', { method: 'PATCH', body: { username } })

export const getRoleOptions = () => request('/api/v1/job-roles')

// ── User management ───────────────────────────────────────────────────────────

export const listUsers = () => request('/api/v1/users')

export const createUser = (payload) =>
  request('/api/v1/users', { method: 'POST', body: payload })

export const deleteUser = (userId) =>
  request(`/api/v1/users/${userId}`, { method: 'DELETE' })

export const updateReportsTo = (userId, reportsTo) =>
  request(`/api/v1/users/${userId}/reports-to`, { method: 'PATCH', body: { reportsTo } })

// ── Skill assessments ─────────────────────────────────────────────────────────

export async function analyzeSkills({ currentRole, targetRole, resume, selfAssessment }) {
  const form = new FormData()
  form.append('currentRole', currentRole)
  form.append('targetRole', targetRole)
  form.append('resume', resume)
  form.append('selfAssessment', JSON.stringify(selfAssessment))
  return request('/api/v1/skill-analysis', { method: 'POST', body: form, isForm: true })
}

export const listMySkills = () => request('/api/v1/skill-analysis')

export const getSkill = (skillId) => request(`/api/v1/skill-analysis/${skillId}`)

export const deleteSkill = (skillId) =>
  request(`/api/v1/skill-analysis/${skillId}`, { method: 'DELETE' })
