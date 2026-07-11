// TODO: update import path when shared AuthContext is confirmed ready
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'

const BASE_URL = import.meta.env.VITE_QUIZ_API_URL || 'http://localhost:8000'

function errorMessage(data, fallback) {
  return data?.message || data?.detail?.message || data?.detail || fallback
}

async function request(path, token, { method = 'GET', body } = {}) {
  if (!token) {
    throw new Error('Your session has expired. Please sign in again.')
  }

  const headers = { Authorization: `Bearer ${token}` }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    throw new Error('Your session has expired. Please sign in again.')
  }

  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(errorMessage(data, 'Request failed'))
  return data
}

/**
 * Custom hook that returns quiz API methods.
 * Each method attaches the JWT from useAuth() as Authorization: Bearer {token}.
 */
export function useQuizApi() {
  const { user } = useAuth()
  const token = user?.access_token ?? null

  return {
    /** GET /api/v1/assessments */
    getAssessments() {
      return request('/api/v1/assessments', token)
    },

    /** GET /api/v1/assessments/{id}/questions */
    getQuestions(assessmentId) {
      return request(`/api/v1/assessments/${assessmentId}/questions`, token)
    },

    /** POST /api/v1/assessments/{id}/submit */
    submitAssessment(assessmentId, answers) {
      return request(`/api/v1/assessments/${assessmentId}/submit`, token, {
        method: 'POST',
        body: { answers },
      })
    },

    /** GET /api/v1/assessments/{id}/history */
    getHistory(assessmentId) {
      return request(`/api/v1/assessments/${assessmentId}/history`, token)
    },

    /** GET /api/v1/assessments/history */
    getAssessmentHistory() {
      return request('/api/v1/assessments/history', token)
    },
  }
}
