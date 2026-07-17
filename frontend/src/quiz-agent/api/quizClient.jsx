import { supabase } from './../../skill-profiler-agent/services/supabase'

const BASE_URL = import.meta.env.VITE_QUIZ_API_URL || 'http://172.16.20.97:8001'

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
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
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

export function useQuizApi() {
  return {
    getEligibilitySummary: async (employeeId) => {
      const data = await request(`/assessment/eligibility/${employeeId}/summary`)
      return data.courses  // Extract courses from wrapper
    },

    takeAssessment: async (payload) => {
      return request('/assessment/take-assessment/', {
        method: 'POST',
        body: payload,
      })
    },

    submitAssessment: async (payload) => {
      return request('/assessment/submit-assessment/', {
        method: 'POST',
        body: payload,
      })
    },

    getReview: async (assessmentId) => {
      return request(`/assessment/submit-assessment/${assessmentId}/review`)
    },
  }
}
