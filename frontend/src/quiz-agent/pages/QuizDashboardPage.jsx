import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuizCard from '../components/QuizCard'
import { mockAssessments } from '../mockData'
import { mockConsumedModules } from '../mockTeam3Data'

// TEMP DEMO MODE: reading from mockData.js instead of useQuizApi().
// Revert to useQuizApi() once VITE_QUIZ_API_URL and auth are ready.
const STATUS_MAP = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'not_started', label: 'Not Started' },
  { key: 'completed', label: 'Completed' },
]

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

function tabKeyForAssessment(assessment) {
  return assessment.status === 'Completed' ? 'completed' : 'not_started'
}

function SkeletonCard() {
  return (
    <div className="card flex h-[168px] w-full max-w-[240px] flex-col justify-between !rounded-xl !p-4">
      <div>
        <div className="skeleton h-5 w-3/4" />
        <div className="mt-4">
          <div className="skeleton mb-2 h-4 w-20" />
          <div className="skeleton h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="skeleton mt-3 h-9 w-full rounded-lg" />
    </div>
  )
}
export default function QuizDashboardPage() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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

  const visibleAssessments = activeTab === 'all'
    ? assessments
    : assessments.filter((assessment) => tabKeyForAssessment(assessment) === activeTab)

  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label.toLowerCase()

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Assessments</h1>
        <p className="mt-1 text-sm text-muted">Track your quiz progress across all completed modules</p>
      </div>

      {!loading && (
        <div className="mb-5 inline-flex rounded-xl border border-line bg-surface p-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-card text-brand-700 shadow-sm dark:text-brand-400'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleAssessments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted">No {activeTabLabel} assessments available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4">
          {visibleAssessments.map((assessment) => (
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






