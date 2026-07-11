import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import QuizCard from '../components/QuizCard'
import { mockAssessments } from '../mockData'
import { mockConsumedModules } from '../mockTeam3Data'

// TEMP DEMO MODE: reading from mockData.js instead of useQuizApi().
// Revert to useQuizApi() once VITE_QUIZ_API_URL and auth are ready.
const STATUS_MAP = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }

function toComponentShape(a) {
  return {
    assessment_id: a.id,
    course_name: a.title,
    module_name: a.description,
    topics: [],
    difficulty: 'Intermediate',
    status: STATUS_MAP[a.status] || a.status,
    question_count: a.question_count,
    evaluation: {
      score: a.last_score,
      total_questions: a.question_count,
      pass_fail_status: a.last_score == null ? 'Pending'
        : a.last_score >= Math.ceil(a.question_count * 0.6) ? 'Pass' : 'Fail',
    },
  }
}

function StatPill({ value, label, wrapperClass = 'border-line bg-card', textClass = 'text-ink', labelClass = 'text-muted' }) {
  return (
    <div className={`flex min-w-[100px] flex-col items-center rounded-lg border px-5 py-3 shadow-sm ${wrapperClass}`}>
      <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
      <span className={`mt-0.5 text-xs font-medium ${labelClass}`}>{label}</span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card flex h-full flex-col justify-between">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton mt-2 h-4 w-1/2" />
          </div>
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-5 w-16 rounded-full" />
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="skeleton h-2.5 w-2.5 rounded-full" />
            <div className="skeleton h-4 w-24" />
          </div>
          <div>
            <div className="skeleton mb-2 h-4 w-20" />
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
      <div className="skeleton mt-6 h-10 w-full rounded-lg" />
    </div>
  )
}

export default function QuizDashboardPage() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    let cancelled = false

    // TEMP DEMO: simulate async fetch from mock data
    const timer = setTimeout(() => {
      if (!cancelled) {
        // TODO: replace mockConsumedModules with real Team 3 API call when available.
        const consumedIds = new Set(mockConsumedModules.map((m) => m.module_id))
        const availableAssessments = mockAssessments.filter((a) => consumedIds.has(a.module_id))
        
        setAssessments(availableAssessments.map(toComponentShape))
        setLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  const stats = useMemo(() => {
    const total = assessments.length
    const passed = assessments.filter((a) => a.evaluation?.pass_fail_status === 'Pass').length
    const needsAttention = assessments.filter(
      (a) => a.evaluation?.pass_fail_status === 'Fail' || a.status === 'Not Started',
    ).length

    return { total, passed, needsAttention }
  }, [assessments])

  const filteredAssessments = useMemo(() => {
    if (activeFilter === 'All') {
      return assessments
    }

    if (activeFilter === 'Passed') {
      return assessments.filter((a) => a.evaluation?.pass_fail_status === 'Pass')
    }

    if (activeFilter === 'Failed & Pending') {
      return assessments.filter(
        (a) => a.evaluation?.pass_fail_status === 'Fail' || a.status === 'Not Started',
      )
    }

    return assessments
  }, [assessments, activeFilter])

  const tabs = ['All', 'Passed', 'Failed & Pending']

  function handleRetry() {
    setError(false)
    setLoading(true)
    // TEMP DEMO: simulate retry with mock data
    setTimeout(() => {
      // TODO: replace mockConsumedModules with real Team 3 API call when available.
      const consumedIds = new Set(mockConsumedModules.map((m) => m.module_id))
      const availableAssessments = mockAssessments.filter((a) => consumedIds.has(a.module_id))
      
      setAssessments(availableAssessments.map(toComponentShape))
      setLoading(false)
    }, 300)
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted">Failed to load assessments. Please try again.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-card p-6">
      {/* Section 1 - Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Assessments</h1>
        <p className="mt-1 text-sm text-muted">Track your quiz progress across all completed modules</p>
      </div>

      <div className="mb-8 inline-block">
        <StatPill value={stats.total} label="Total Assessments" wrapperClass="border-line bg-card px-8" />
      </div>

      {/* Section 2 - Filter tabs */}
      <div className="mb-6 flex gap-6 border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveFilter(tab)}
            className={`-mb-px pb-3 text-sm font-semibold transition-colors cursor-pointer ${
              activeFilter === tab
                ? 'border-b-2 border-brand-500 text-brand-500'
                : 'border-b-2 border-transparent text-muted hover:border-line hover:text-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Section 3 - Assessment cards */}
      {loading ? (
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted">No assessments in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssessments.map((assessment) => (
            <QuizCard
              key={assessment.assessment_id}
              assessment={assessment}
              onStart={(a) => navigate(`/quiz/${a.assessment_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
