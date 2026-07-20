import { supabase } from '../../skill-profiler-agent/services/supabase'

const BASE_URL = import.meta.env.VITE_USE_ANALYTICS_API_URL || 'http://localhost:8005'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

function errorMessage(data, fallback) {
  return data?.message || data?.detail?.message || data?.detail || fallback
}

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

async function request(path, { method = 'GET', body } = {}) {
  const token = await getToken()
  if (!token) {
    await handleSessionExpired()
    throw new Error('Your session has expired. Please sign in again.')
  }

  const headers = { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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


export async function getEmployeeData(employeeId) {
  return request(`/api/v1/employees/${employeeId}/dashboard`)
}

export async function getManagerData(managerId) {
  return request(`/api/v1/manager/${managerId}/dashboard`)
}

export async function getExecutiveData() {
  return request('/api/v1/executive/dashboard')
}
