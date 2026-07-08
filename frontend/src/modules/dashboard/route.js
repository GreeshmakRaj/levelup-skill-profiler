import Dashboard from './pages/Dashboard'

// Dashboard — landing dashboard and employee management.
// `roles: null` means every authenticated user can see it.
export const routes = [
  { path: '/dashboard', Component: Dashboard, roles: null },
]

export const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: null },
]
