import { supabase } from './supabase'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

export async function request(path, { method = 'GET', body, isForm = false } = {}) {
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
