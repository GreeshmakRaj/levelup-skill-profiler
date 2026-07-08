import Assessments from './pages/Assessments'

// Team 4 — AI assessments.
export const routes = [
  { path: '/assessments', Component: Assessments, roles: null },
]

export const nav = [
  { to: '/assessments', label: 'AI Assessments', icon: 'assessment', roles: null },
]
