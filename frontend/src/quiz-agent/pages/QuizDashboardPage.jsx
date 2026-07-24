import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizApi } from '../api/quizClient'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import QuizCard from '../components/QuizCard'
import AssessmentHistoryModal from '../components/AssessmentHistoryModal'

const STATUS_MAP = { not_started: 'Not Started', in_progress: 'In Progress', completed: 'Completed' }



function toComponentShape(a) {
  return {
    course_id: a.course_id || a.id,
    course_name: a.course_name || a.title,
    module_name: a.module_name || a.description,
    topics: a.topics || [],
    difficulty: a.difficulty || 'Intermediate',
    status: STATUS_MAP[a.status] || a.status || 'Not Started',
    question_count: a.question_count || 10,
    evaluation: {
      score: a.last_score,
      total_questions: a.question_count,
      pass_fail_status: a.last_score == null ? 'Pending'
        : a.last_score >= Math.ceil(a.question_count * 0.6) ? 'Pass' : 'Fail',
    },
  }
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
  const [courseHistory, setCourseHistory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const { user, role } = useAuth()
  const api = useQuizApi()
  console.log("user id ", user.id)

  useEffect(() => {
    const storedSession = localStorage.getItem('quizSession')
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession)
        setActiveSession(session)
      } catch (err) {
        console.error('Failed to parse quizSession:', err)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      try {
        console.log('Fetching courses and history...')

        const courses = await api.getEligibilitySummary(user?.id)
        if (cancelled) return
        
        console.log('Courses loaded:', courses)
        setAssessments(courses.map(toComponentShape))

        setLoading(false)
      } catch (err) {
        console.error('Error loading courses:', err.message)
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    fetchAll()

    const handleFocus = () => {
      console.log('Refetching data on page focus...')
      api.getEligibilitySummary(user?.id).then((courses) => {
        if (cancelled) return
        setAssessments(courses.map(toComponentShape))
      }).catch(err => console.error(err))
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    const fetchCourseHistory = async () => {
      try {
        const historyRes = await api.getAssessmentHistory(user?.id)
        
        // Create a map of course_id -> history data for quick lookup
        const historyMap = {}
        if (historyRes?.assessments) {
          historyRes.assessments.forEach(item => {
            historyMap[item.course_id] = item
          })
        }
        setCourseHistory(historyMap)
      } catch (err) {
        console.error('Failed to fetch course history:', err)
      }
    }

    if (user?.id) {
      fetchCourseHistory()
    }
  }, [user?.id])

  function handleRetry() {
    setError(false)
    setLoading(true)

    // TODO: Replace hardcoded user ID with real mapping from Supabase user.id to employee/assessment ID
    api.getEligibilitySummary(user?.id).then(courses => {
      setAssessments(courses.map(toComponentShape))
      setLoading(false)
    }).catch(err => {
      setError(err.message)
      setLoading(false)
    })
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
    <div className="w-full h-full overflow-y-auto bg-card p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">My Assessments</h1>
        <p className="mt-1 text-sm text-muted">Track your quiz progress across all completed modules</p>
      </div>



      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : assessments.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted">No assessments available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start gap-4">
          {assessments.map((course) => (
            <QuizCard
              key={course.course_id}
              course={course}
              history={courseHistory[course.course_id]}
              activeSession={activeSession}
              onStart={(c) => navigate(`/assessment/${c.course_id}`, { state: { course: c } })}
              onViewHistory={(c) => setSelectedCourse(c)}
            />
          ))}
        </div>
      )}

      {/* History Modal */}
      {selectedCourse && (
        <AssessmentHistoryModal
          courseId={selectedCourse.course_id}
          courseName={selectedCourse.course_name}
          userId={user.id}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  )
}
