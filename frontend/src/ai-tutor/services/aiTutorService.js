import { supabase } from '../../skill-profiler-agent/services/supabase'

const TUTOR_BASE_URL = import.meta.env.VITE_AI_TUTOR_URL || 'http://localhost:8001'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
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

async function handleSessionExpired() {
  try {
    await supabase.auth.signOut()
  } catch {
  }
  if (window.location.pathname !== '/auth') {
    window.location.assign('/auth')
  }
}

async function tutorRequest(path, { method = 'GET', body, isForm = false } = {}) {
  const token = await getToken()
  if (!token) {
    await handleSessionExpired()
    throw new Error('Your session has expired. Please sign in again.')
  }

  const headers = { Authorization: `Bearer ${token}` }
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${TUTOR_BASE_URL}${path}`, {
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

export const createTutorSession = (moduleId = 'general') =>
  tutorRequest('/tutor/sessions', { method: 'POST', body: { module_id: moduleId } })

export async function chatWithTutor(message, history = [], docContext = '', sessionId = null) {
  if (!sessionId) throw new Error('No active tutor session.')
  const data = await tutorRequest(
    `/tutor/sessions/${encodeURIComponent(sessionId)}/messages`,
    { method: 'POST', body: { message, history, doc_context: docContext } },
  )
  return { reply: data.response, grounded: data.grounded, sources: data.sources }
}

export async function uploadTutorDoc(file, moduleId = 'general') {
  const form = new FormData()
  form.append('file', file)
  const data = await tutorRequest(
    `/tutor/documents?module_id=${encodeURIComponent(moduleId)}`,
    { method: 'POST', body: form, isForm: true },
  )
  return {
    docId: data.doc_id,
    filename: file.name,
    ext: data.ext || (file.name.split('.').pop() || '').toLowerCase(),
    matchedKeywords: [],
    uploadedAt: new Date().toISOString(),
    textPreview: data.text_preview || '',
  }
}

export const deleteTutorDoc = (docId, ext) =>
  tutorRequest(
    `/tutor/documents/${encodeURIComponent(docId)}?ext=${encodeURIComponent(ext)}`,
    { method: 'DELETE' },
  )