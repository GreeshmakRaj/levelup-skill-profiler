const TUTOR_BASE_URL = import.meta.env.VITE_AI_TUTOR_URL || 'http://localhost:8000/api/v1'

function withNormalizedBase(baseUrl) {
  return String(baseUrl || '').replace(/\/+$/, '')
}

function errorMessage(data, fallback) {
  if (typeof data?.message === 'string' && data.message) return data.message
  if (data?.detail && typeof data.detail === 'object' && !Array.isArray(data.detail)) {
    if (typeof data.detail.message === 'string') return data.detail.message
  }
  if (typeof data?.detail === 'string' && data.detail) return data.detail
  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    return data.detail[0]?.msg || data.detail[0]?.message || fallback
  }
  return fallback
}

function toQuery(params) {
  const query = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  const result = query.toString()
  return result ? `?${result}` : ''
}

async function tutorRequest(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  const normalizedBase = withNormalizedBase(TUTOR_BASE_URL)
  const tryUrls = [
    `${normalizedBase}${path}`,
  ]

  // Local Team 3 backend in this workspace serves /tutor/* without /api/v1.
  if (normalizedBase.endsWith('/api/v1')) {
    tryUrls.push(`${normalizedBase.replace(/\/api\/v1$/, '')}${path}`)
  }

  let res
  let data
  for (let i = 0; i < tryUrls.length; i += 1) {
    res = await fetch(tryUrls[i], {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (res.status !== 404 || i === tryUrls.length - 1) {
      data = await res.json().catch(() => ({}))
      break
    }
  }

  if (res.status === 204) return null
  if (!res.ok) throw new Error(errorMessage(data, 'Request failed'))
  return data
}

export const listRoadmaps = (userId) =>
  tutorRequest(`/tutor/roadmaps${toQuery({ user_id: userId })}`)

export const listSessions = (userId, skillId) =>
  tutorRequest(`/tutor/sessions${toQuery({ user_id: userId, skill_id: skillId })}`)

export const createTutorSession = (userId, skillId) =>
  tutorRequest('/tutor/sessions', {
    method: 'POST',
    body: { user_id: userId, skill_id: skillId },
  })

export const listSessionMessages = (sessionId, userId, limit = 100, offset = 0) =>
  tutorRequest(
    `/tutor/sessions/${encodeURIComponent(sessionId)}/messages${toQuery({ user_id: userId, limit, offset })}`,
  )

export const listSuggestions = (sessionId, userId) =>
  tutorRequest(`/tutor/sessions/${encodeURIComponent(sessionId)}/suggestions${toQuery({ user_id: userId })}`)

export async function sendMessage(sessionId, userId, message) {
  return tutorRequest(`/tutor/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    body: { user_id: userId, message },
  })
}

export const submitFeedback = (sessionId, userId, messageId, rating, comment) =>
  tutorRequest(`/tutor/sessions/${encodeURIComponent(sessionId)}/feedback`, {
    method: 'POST',
    body: { user_id: userId, message_id: messageId, rating, comment },
  })

export const completeRoadmap = (skillId, userId) =>
  tutorRequest(`/tutor/roadmaps/${encodeURIComponent(skillId)}/complete`, {
    method: 'POST',
    body: { user_id: userId },
  })

export const listDocuments = (userId, skillId) =>
  tutorRequest(`/tutor/documents${toQuery({ user_id: userId, skill_id: skillId })}`)

export async function uploadTutorDoc(userId, skillId, file) {
  const form = new FormData()
  form.append('user_id', userId)
  form.append('skill_id', skillId)
  form.append('file', file)
  return tutorRequest('/tutor/documents', { method: 'POST', body: form, isForm: true })
}

export const getDocumentStatus = (documentId) =>
  tutorRequest(`/tutor/documents/${encodeURIComponent(documentId)}/status`)
