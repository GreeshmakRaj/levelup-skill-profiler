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
import InsightsPanel from '../components/Insights'

const ROLE_VIEWS = {
  EMPLOYEE: ['Employee'],
  MANAGER: ['Employee', 'Manager'],
  // ADMIN: ['Employee', 'Manager', 'Executive'],
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
      {allowedViews.map((view) => (
        <button
          key={view}
          type="button"
          onClick={() => onChange(view)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            active === view
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-muted hover:text-ink hover:bg-surface'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { profile, role } = useAuth()
  // const [activeView, setActiveView] = useState('Employee')
  const [analyticsState, setAnalyticsState] = useState({ view: null, response: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const allowedViews = ROLE_VIEWS[role] || ['Employee']
  const [activeView, setActiveView] = useState(allowedViews[0])
  const [showInsights, setShowInsights] = useState(false)

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
      <div className="relative flex items-center justify-between">
        {role === 'MANAGER' && (
            <Tabs
              allowedViews={allowedViews}
              active={activeView}
              onChange={setActiveView}
            />

          )}
          {data?.insights?.length > 0 && (
            <button
              onClick={() => setShowInsights((prev) => !prev)}
              className="ml-3 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface shadow-sm transition hover:bg-elevated"
              title="AI Insights"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5 text-amber-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12c.6.6 1 1.3 1.3 2h5.4c.3-.7.7-1.4 1.3-2A7 7 0 0012 2z"
                />
              </svg>
            </button>
          )}

          <InsightsPanel
            insights={data?.insights || []}
            open={showInsights}
            onClose={() => setShowInsights(false)}
          />
      </div>

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
          {/* {activeView === 'Executive' && <ExecutiveView data={data} />} */}
        </>
      )}
    </div>
  )
}
