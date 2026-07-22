import { useEffect, useMemo, useState } from 'react'
import {
  getEmployeeAnalytics,
  getExecutiveAnalytics,
  getManagerAnalytics,
} from '../services/analytics'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import StatCard from '../components/StatCard'
import EmployeeView from './EmployeeView'
import ManagerView from './ManagerView'
import ExecutiveView from './ExecutiveView'

const ANALYTICS_VIEWS = ['Employee', 'Manager', 'Executive']
const ROLE_VIEWS = {
  EMPLOYEE: ['Employee'],
  MANAGER: ['Employee', 'Manager'],
  ADMIN: ['Employee', 'Manager', 'Executive'],
}

function fetchAnalyticsForView(view, profile) {
  if (view === 'Manager') {
    return getManagerAnalytics(profile.userId)
  }

  if (view === 'Executive') {
    return getExecutiveAnalytics()
  }

  return getEmployeeAnalytics(profile.userId)
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Analytics</h1>
      <p className="text-sm text-muted mt-1">Role-based insights across employees, teams, and the organization.</p>
    </div>
  )
}

function Tabs({ active, onChange, allowedViews = [] }) {
  return (
    <div className="inline-flex rounded-xl bg-elevated border border-line p-1 shadow-sm">
      {ANALYTICS_VIEWS.map((view) => {
        const enabled = allowedViews.includes(view)

        return (
          <button
            key={view}
            type="button"
            disabled={!enabled}
            onClick={() => enabled && onChange(view)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active === view
                ? 'bg-brand-500 text-white shadow-sm'
                : enabled
                ? 'text-muted hover:text-ink hover:bg-surface'
                : 'text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            {view}
          </button>
        )
      })}
    </div>
  )
}

export default function Analytics() {
  const { profile, role } = useAuth()
  const [activeView, setActiveView] = useState('Employee')
  const [analyticsState, setAnalyticsState] = useState({ view: null, response: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const allowedViews = ROLE_VIEWS[role] || ['Employee']

  useEffect(() => {
    if (!allowedViews.includes(activeView)) {
      setActiveView(allowedViews[0])
    }
  }, [allowedViews, activeView])

  useEffect(() => {
  if (!profile?.userId) return;

  let cancelled = false;

  async function loadAnalytics() {
    setLoading(true);
    setError('');

    try {
      const nextResponse = await fetchAnalyticsForView(
        activeView,
        profile
      );

      if (!cancelled) {
        setAnalyticsState({
          view: activeView,
          response: nextResponse,
        });
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message || 'Unable to load analytics');
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadAnalytics();

  return () => {
    cancelled = true;
  };
}, [activeView, profile]);

  const data = useMemo(
    () => (
      analyticsState.response && analyticsState.view === activeView
        ? analyticsState.response
        : null
    ),
    [activeView, analyticsState],
  )

  return (
    <div className="space-y-6">
      <PageHeader />
      <Tabs
        allowedViews={allowedViews}
        active={activeView}
        onChange={setActiveView}
      />

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => <div key={index} className="skeleton h-24" />)}
        </div>
      )}

      {error && (
        <div className="card p-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {data.stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {activeView === 'Employee' && <EmployeeView data={data} />}
          {activeView === 'Manager' && <ManagerView data={data} />}
          {activeView === 'Executive' && <ExecutiveView data={data} />}
        </>
      )}
    </div>
  )
}
