import { NavLink } from "react-router-dom";
import { ROLES } from "../../constants/roles";

const ICONS = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
  paths: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  roadmaps: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />,
   tutor: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />,
};

function navForRole(role) {
  const items = [{ to: "/dashboard", label: "Dashboard", icon: "dashboard" }];
  if (role === ROLES.MANAGER || role === ROLES.EMPLOYEE) {
    items.push({ to: "/learning-paths", label: "Learning Paths", icon: "paths" });
    items.push({ to: "/roadmaps-list", label: "Roadmaps", icon: "roadmaps" });
    items.push({ to: "/ai-tutor", label: "AI Tutor", icon: "tutor" });
  }
  return items;
}

export default function Sidebar({ role, collapsed = false, onNavigate }) {
  const items = navForRole(role);
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Primary">
      {!collapsed && <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">Menu</p>}
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} onClick={onNavigate} title={collapsed ? item.label : undefined} className={({ isActive }) => `group flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${collapsed ? "justify-center px-2.5 py-2.5" : "px-3 py-2.5"} ${isActive ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400" : "text-muted hover:bg-surface hover:text-ink"}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {ICONS[item.icon]}
          </svg>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
