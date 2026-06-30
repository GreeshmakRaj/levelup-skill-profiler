import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token
}

export async function analyzeSkills({ employeeId, currentRole, targetRole, resume, selfAssessment }) {
  const token = await getToken()
  const form = new FormData()
  form.append('employeeId', employeeId)
  form.append('currentRole', currentRole)
  form.append('targetRole', targetRole)
  form.append('resume', resume)
  form.append('selfAssessment', JSON.stringify(selfAssessment))

  const res = await fetch(`${BASE_URL}/api/v1/skills/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.detail?.message || 'Analysis failed')
  return data
}

export async function getEmployeeSkills(employeeId) {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/api/v1/employees/${employeeId}/skills`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.detail?.message || 'Failed to load profile')
  return data
}
