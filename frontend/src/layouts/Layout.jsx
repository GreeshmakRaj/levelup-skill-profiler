'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@global/hooks/useAuth'
import Sidebar from './Sidebar'
import ProfileMenu from './profile/ProfileMenu'
import ThemeToggle from '@global/components/ThemeToggle'
import { APP_NAME } from '@global/constants/app'

const COLLAPSE_KEY = 'skill-profiler-sidebar-collapsed'

const ROUTE_LABELS = {
  dashboard: 'Dashboard',
  'learning-paths': 'Learning Paths',
}

function Brand({ compact = false }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0">
        <svg className="w-4.5 h-4.5 text-white" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.872 1.884l-.1.666A1 1 0 0115 19h-6a1 1 0 01-.995-1.083l-.1-.666a3 3 0 00-.872-1.884l-.347-.347z" />
        </svg>
      </div>
      {!compact && <span className="font-semibold text-ink">{APP_NAME}</span>}
    </Link>
  )
}

function Breadcrumb() {
  const pathname = usePathname()
  const segs = pathname.split('/').filter(Boolean)
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-sm">
      <span className="text-faint">Home</span>
      {segs.map((seg) => (
        <span key={seg} className="flex items-center gap-1.5">
          <span className="text-faint">/</span>
          <span className="text-ink font-medium">{ROUTE_LABELS[seg] || seg}</span>
        </span>
      ))}
    </nav>
  )
}

export default function Layout({ children }) {
  const { role } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(COLLAPSE_KEY) === '1' : false
  )

  useEffect(() => { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0') }, [collapsed])

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="bg-elevated border-b border-line sticky top-0 z-20">
        <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              className="md:hidden p-2 -ml-1 rounded-lg text-muted hover:bg-surface"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              className="hidden md:inline-flex p-2 rounded-lg text-muted hover:bg-surface hover:text-ink"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Brand />
            <span className="hidden lg:block w-px h-5 bg-line" />
            <Breadcrumb />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <span className="w-px h-6 bg-line mx-1" />
            <ProfileMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar – desktop */}
        <aside
          className={`hidden md:flex flex-col shrink-0 border-r border-line bg-elevated min-h-[calc(100vh-3.5rem)] sticky top-14 transition-[width] duration-200 ease-in-out ${
            collapsed ? 'w-[68px]' : 'w-60'
          }`}
        >
          <Sidebar role={role} collapsed={collapsed} />
        </aside>

        {/* Sidebar – mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-30">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-14 bottom-0 w-64 bg-elevated border-r border-line shadow-lift animate-[fadeIn_.15s_ease]">
              <Sidebar role={role} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
