import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { mockAssessments } from '../mockData'
import AttemptHistory from '../components/AttemptHistory'
import { ChevronLeft } from 'lucide-react'

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
  }
}

export default function AttemptHistoryPage() {
  const { quiz_id: assessment_id } = useParams()
  const navigate = useNavigate()

  const [history, setHistory] = useState([])
  const [assessmentMeta, setAssessmentMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // TEMP DEMO: no real history endpoint — use empty history + mock meta
      const allAssessments = mockAssessments.map(toComponentShape)
      const meta = allAssessments.find((a) => a.assessment_id === assessment_id)

      setHistory([]) // No attempt history in demo mode
      setAssessmentMeta(meta || null)
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (assessment_id) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment_id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card p-6">
        <div className="text-lg font-semibold text-muted">Loading attempt history...</div>
      </div>
    )
  }

  if (error || !assessmentMeta) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-card p-6">
        <div className="text-lg font-semibold text-red-600">{error || 'Assessment not found'}</div>
        <button
          type="button"
          onClick={fetchData}
          className="btn-primary mt-4"
        >
          Retry
        </button>
      </div>
    )
  }

  const totalAttempts = history.length
  let bestScoreStr = '—'
  let latestStatusStr = '—'
  let bestScore = -1

  if (totalAttempts > 0) {
    const scores = history.map((h) => h.score).filter((s) => s != null)
    if (scores.length > 0) {
      bestScore = Math.max(...scores)
      const totalQ = history[0].total_questions
      bestScoreStr = `${bestScore} / ${totalQ}`
    }

    const sortedHistory = [...history].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    const latestAttempt = sortedHistory[0]

    latestStatusStr = latestAttempt.pass_fail_status || '—'
  }

  const visibleTopics = assessmentMeta.topics ? assessmentMeta.topics.slice(0, 2) : []
  const hiddenTopicsCount = assessmentMeta.topics ? Math.max(assessmentMeta.topics.length - 2, 0) : 0

  return (
    <div className="w-full bg-card p-6">
      <Link
        to="/quiz"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Quiz Dashboard
      </Link>

      {/* Section 1 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{assessmentMeta.course_name}</h1>
        <p className="mt-1 text-sm text-muted">{assessmentMeta.module_name || '—'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="skill-pill">
            {assessmentMeta.difficulty || 'Beginner'}
          </span>
          <span className="skill-pill">
            {assessmentMeta.question_count} Questions
          </span>
          {visibleTopics.map((topic) => (
            <span key={topic} className="skill-pill">
              {topic}
            </span>
          ))}
          {hiddenTopicsCount > 0 && (
            <span className="skill-pill">
              +{hiddenTopicsCount} more
            </span>
          )}
        </div>
      </div>

      {/* Section 2 */}
      <div className="mb-8 flex flex-wrap gap-4">
        <div className="flex min-w-[120px] flex-col rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-semibold uppercase text-muted">Total Attempts</span>
          <span className="mt-1 text-2xl font-bold text-ink">{totalAttempts}</span>
        </div>
        <div className="flex min-w-[120px] flex-col rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-semibold uppercase text-muted">Best Score</span>
          <span className="mt-1 text-2xl font-bold text-ink">{bestScoreStr}</span>
        </div>
        <div className="flex min-w-[120px] flex-col rounded-xl border border-line bg-surface p-4">
          <span className="text-xs font-semibold uppercase text-muted">Latest Status</span>
          <span
            className={`mt-1 text-2xl font-bold ${latestStatusStr === 'Pass'
              ? 'text-green-600'
              : latestStatusStr === 'Fail'
                ? 'text-red-600'
                : 'text-ink'
              }`}
          >
            {latestStatusStr}
          </span>
        </div>
      </div>

      {/* Section 3 */}
      <div className="mt-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-ink">Attempt History</h2>
          <p className="mt-1 text-sm text-muted">Review your past performance and scores for this assessment</p>
        </div>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-12">
            <p className="mb-4 text-sm text-muted">No attempts yet. Start this assessment from your dashboard.</p>
            <button
              type="button"
              onClick={() => navigate('/quiz')}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...history]
              .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
              .map((attempt, idx) => (
                <AttemptHistory
                  key={attempt.evaluated_at || idx}
                  attempt={attempt}
                  attemptNumber={totalAttempts - idx}
                  isBest={attempt.score != null && attempt.score === bestScore}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
