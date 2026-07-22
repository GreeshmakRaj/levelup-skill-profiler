import { supabase } from './../../skill-profiler-agent/services/supabase'

const BASE_URL = import.meta.env.VITE_QUIZ_API_URL || 'http://172.16.20.97:8001'

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
  const token = import.meta.env.VITE_ASSESSMENT_API_TOKEN

  const headers = {
    'Content-Type': 'application/json',
  }

  // Only add bearer token for this specific endpoint
  if (path.includes('/assessment/results/employees/') && path.includes('/assessments')) {
    if (!token) {
      throw new Error('Assessment API token is not configured. Check your .env file.')
    }
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    const isAuthEndpoint = path.includes('/auth') || path.includes('/login') || path.includes('/session') || path.includes('/refresh')
    if (isAuthEndpoint) {
      await handleSessionExpired()
      throw new Error('Your session has expired. Please sign in again.')
    } else {
      throw new Error('Unauthorized: ' + res.statusText)
    }
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
      console.log('takeAssessment started at:', new Date().toISOString())
      try {
        const start = performance.now()
        const result = await request('/assessment/take-assessment/', {
          method: 'POST',
          body: payload,
        })
        const end = performance.now()
        console.log('takeAssessment completed in:', (end - start).toFixed(2), 'ms')
        console.log('Response:', result)
        return result
      } catch (err) {
        console.error('takeAssessment failed:', err.message)
        throw err
      }
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

    getAssessmentHistory: async (userId) => {
      return request(`/assessment/assessments/${userId}/history`)
    },

    getDetailedResults: async (userId, limit = 20, offset = 0) => {
      return request(`/assessment/results/employees/${userId}/assessments?limit=${limit}&offset=${offset}`)
    },
  }
}
