// Sidebar nav registry. Add your feature's entry here when building a new module.
// icon keys must match the ICONS map in src/layouts/Sidebar.jsx
// roles: null  → visible to every authenticated user
// roles: [...]  → visible only to those roles
export const NAV_ITEMS = [
  { to: '/dashboard',      label: 'Dashboard',      icon: 'dashboard',  roles: null },
  { to: '/learning-paths', label: 'Learning Paths',  icon: 'paths',      roles: ['MANAGER', 'EMPLOYEE'] },
  { to: '/roadmaps',        label: 'Roadmaps',         icon: 'roadmap',    roles: null },
  { to: '/ai-tutor',       label: 'AI Tutor',        icon: 'tutor',      roles: null },
  { to: '/assessments',    label: 'AI Assessments',  icon: 'assessment', roles: null },
]
