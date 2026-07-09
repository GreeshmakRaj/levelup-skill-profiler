import { useMemo, useState } from 'react'

const VIEWS = ['Employee', 'Manager', 'Executive']

const TREND_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

const ANALYTICS = {
  Employee: {
    stats: [
      { label: 'Current Skill Score', value: '78', delta: '+6' },
      { label: 'Learning %', value: '64%', delta: '+12%' },
      { label: 'Quiz Average', value: '86%', delta: '+4%' },
      { label: 'Certificates', value: '9', delta: '+1' },
    ],
    trend: [52, 58, 62, 66, 72, 80],
    certificates: [
      'AWS Cloud Practitioner',
      'Python for Data Science',
      'Machine Learning Foundations',
    ],
  },
  Manager: {
    stats: [
      { label: 'Team Members', value: '24', delta: '+2' },
      { label: 'Avg Progress', value: '61%', delta: '+8%' },
      { label: 'Pending Trainings', value: '11', delta: '-3', negative: true },
      { label: 'Certifications', value: '38', delta: '+5' },
    ],
    progress: [
      { name: 'Priya', value: 88 },
      { name: 'Rahul', value: 72 },
      { name: 'Anu', value: 64 },
      { name: 'Karan', value: 55 },
      { name: 'Maya', value: 48 },
      { name: 'Dev', value: 30 },
    ],
    distribution: [
      { label: 'AI / ML', value: 28, color: '#0891b2' },
      { label: 'Cloud', value: 24, color: '#10b981' },
      { label: 'Backend', value: 22, color: '#d97706' },
      { label: 'Data', value: 16, color: '#ef4444' },
      { label: 'Frontend', value: 10, color: '#7c3aed' },
    ],
    topPerformers: [
      { name: 'Priya Menon', initials: 'PM', role: 'Senior Engineer', score: 94 },
      { name: 'Rahul Verma', initials: 'RV', role: 'Data Scientist', score: 91 },
      { name: 'Anu Iyer', initials: 'AI', role: 'ML Engineer', score: 88 },
    ],
  },
  Executive: {
    stats: [
      { label: 'Overall AI Score', value: '72', delta: '+9' },
      { label: 'Training ROI', value: '3.4x', delta: '+0.4x' },
      { label: 'Training Cost', value: '$184K', delta: '-6%', negative: true },
      { label: 'Avg Completion', value: '74%', delta: '+8%' },
    ],
    completion: [42, 48, 55, 62, 69, 75],
    target: [50, 55, 60, 65, 71, 75],
    score: 72,
    readiness: [
      { department: 'Engineering', value: 78 },
      { department: 'Data', value: 71 },
      { department: 'Product', value: 64 },
      { department: 'Sales', value: 52 },
      { department: 'Support', value: 44 },
    ],
  },
}

function PageHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Analytics</h1>
      <p className="text-sm text-muted mt-1">Role-based insights across employees, teams, and the organization.</p>
    </div>
  )
}

function StatCard({ label, value, delta, negative = false }) {
  return (
    <div className="card p-4 min-h-[96px] flex flex-col justify-between">
      <p className="text-sm text-muted">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-ink">{value}</p>
        <span className={`text-xs font-semibold pb-1 ${negative ? 'text-red-500' : 'text-emerald-600'}`}>
          {delta}
        </span>
      </div>
    </div>
  )
}

function Tabs({ active, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-elevated border border-line p-1 shadow-sm">
      {VIEWS.map((view) => (
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

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-5">
        <h2 className="font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function LineChart({ series, target }) {
  const width = 720
  const height = 230
  const pad = 32
  const points = series.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / (series.length - 1)
    const y = height - pad - (value / 100) * (height - pad * 2)
    return `${x},${y}`
  })
  const targetPoints = target?.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / (target.length - 1)
    const y = height - pad - (value / 100) * (height - pad * 2)
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = height - pad - (tick / 100) * (height - pad * 2)
        return (
          <g key={tick}>
            <line x1={pad} x2={width - pad} y1={y} y2={y} stroke="currentColor" className="text-line" strokeDasharray="4 4" />
            <text x={8} y={y + 4} className="fill-muted text-[11px]">{tick}</text>
          </g>
        )
      })}
      {TREND_MONTHS.map((month, index) => {
        const x = pad + (index * (width - pad * 2)) / (TREND_MONTHS.length - 1)
        return <text key={month} x={x - 9} y={height - 8} className="fill-muted text-[11px]">{month}</text>
      })}
      {targetPoints && (
        <polyline points={targetPoints.join(' ')} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5 5" />
      )}
      <polyline points={points.join(' ')} fill="none" stroke="#0891b2" strokeWidth="3" />
      {points.map((point) => {
        const [x, y] = point.split(',')
        return <circle key={point} cx={x} cy={y} r="4" fill="rgb(var(--card))" stroke="#0891b2" strokeWidth="2" />
      })}
    </svg>
  )
}

function BarChart({ data }) {
  return (
    <div className="h-64 grid grid-cols-6 gap-4 items-end px-4 border-b border-line">
      {data.map((item) => (
        <div key={item.name} className="flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-full max-w-[72px] bg-cyan-600 rounded-t-lg"
            style={{ height: `${item.value}%` }}
            title={`${item.name}: ${item.value}%`}
          />
          <span className="text-xs text-muted">{item.name}</span>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data, score }) {
  const gradient = data
    ? `conic-gradient(${data.map((item, index) => {
        const previous = data.slice(0, index).reduce((sum, entry) => sum + entry.value, 0)
        return `${item.color} ${previous}% ${previous + item.value}%`
      }).join(', ')})`
    : `conic-gradient(#0891b2 0% ${score}%, rgb(var(--border)) ${score}% 100%)`

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative w-44 h-44 rounded-full" style={{ background: gradient }}>
        <div className="absolute inset-8 rounded-full bg-card flex flex-col items-center justify-center">
          {score ? (
            <>
              <span className="text-3xl font-bold text-ink">{score}</span>
              <span className="text-xs text-muted">out of 100</span>
            </>
          ) : null}
        </div>
      </div>
      {data && (
        <div className="flex flex-wrap justify-center gap-3">
          {data.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function TopPerformers({ performers }) {
  return (
    <ChartCard title="Top performers" subtitle="Highest completion and quiz scores this quarter">
      <div className="space-y-3">
        {performers.map((performer, index) => (
          <div
            key={performer.name}
            className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                {index + 1}
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                {performer.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{performer.name}</p>
                <p className="truncate text-xs text-muted">{performer.role}</p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold text-ink">{performer.score}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-faint">score</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function DepartmentReadiness({ items }) {
  return (
    <ChartCard title="Department readiness" subtitle="AI / digital skill maturity by department">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.department}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{item.department}</span>
              <span className="text-xs font-semibold text-muted">{item.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-500/15">
              <div
                className="h-full rounded-full bg-cyan-600"
                style={{ width: `${item.value}%` }}
                aria-label={`${item.department} readiness ${item.value}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

function EmployeeView({ data }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <ChartCard title="Skill score trend" subtitle="Last 6 months">
        <LineChart series={data.trend} />
      </ChartCard>
      <ChartCard title="Certificates earned" subtitle="Verified credentials">
        <div className="space-y-3">
          {data.certificates.map((certificate) => (
            <div key={certificate} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3">
              <div>
                <p className="font-semibold text-ink text-sm">{certificate}</p>
                <p className="text-xs text-muted">Issued Jun 2026</p>
              </div>
              <span className="chip bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">Verified</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

function ManagerView({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Team progress" subtitle="Course completion by team member">
          <BarChart data={data.progress} />
        </ChartCard>
        <ChartCard title="Skill distribution" subtitle="Where the team is investing">
          <DonutChart data={data.distribution} />
        </ChartCard>
      </div>
      <TopPerformers performers={data.topPerformers} />
    </div>
  )
}

function ExecutiveView({ data }) {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <ChartCard title="Completion trend vs target" subtitle="Org-wide learning completion">
          <LineChart series={data.completion} target={data.target} />
        </ChartCard>
        <ChartCard title="Overall AI score" subtitle="Composite readiness">
          <DonutChart score={data.score} />
        </ChartCard>
      </div>
      <DepartmentReadiness items={data.readiness} />
    </div>
  )
}

export default function Analytics() {
  const [activeView, setActiveView] = useState('Employee')
  const data = useMemo(() => ANALYTICS[activeView], [activeView])

  return (
    <div className="space-y-6">
      <PageHeader />
      <Tabs active={activeView} onChange={setActiveView} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {activeView === 'Employee' && <EmployeeView data={data} />}
      {activeView === 'Manager' && <ManagerView data={data} />}
      {activeView === 'Executive' && <ExecutiveView data={data} />}
    </div>
  )
}
