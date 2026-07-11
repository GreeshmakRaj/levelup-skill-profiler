import { NavLink } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { ROLES } from '../../constants/roles'

const ICONS = {
  dashboard: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  paths: (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  quiz: <ClipboardList className="w-5 h-5 shrink-0" strokeWidth={2} />,
}

function navForRole(role) {
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/quiz', label: 'Quiz', icon: 'quiz' },
  ]
  if (role === ROLES.MANAGER || role === ROLES.EMPLOYEE) {
    items.push({ to: '/learning-paths', label: 'Learning Paths', icon: 'paths' })
  }
  return items
}

export default function Sidebar({ role, collapsed = false, onNavigate }) {
  const items = navForRole(role)
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Primary">
      {!collapsed && (
        <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">Menu</p>
      )}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
              collapsed ? 'justify-center px-2.5 py-2.5' : 'px-3 py-2.5'
            } ${
              isActive || (item.to === '/quiz' && window.location.pathname.startsWith('/quiz'))
                ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400'
                : 'text-muted hover:bg-surface hover:text-ink'
            }`
          }
        >
          {ICONS[item.icon]}
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
