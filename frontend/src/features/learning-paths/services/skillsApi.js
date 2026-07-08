import { request } from '@global/services/http'

// Team 2 — skill-gap analysis endpoints.
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
