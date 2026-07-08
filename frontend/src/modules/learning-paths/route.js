import { ROLES } from '@global/constants/roles'
import LearningPaths from './pages/LearningPaths'

// Learning Paths — skill-gap analysis and learning path results.
export const routes = [
  { path: '/learning-paths', Component: LearningPaths, roles: [ROLES.MANAGER, ROLES.EMPLOYEE] },
]

export const nav = [
  { to: '/learning-paths', label: 'Learning Paths', icon: 'paths', roles: [ROLES.MANAGER, ROLES.EMPLOYEE] },
]
