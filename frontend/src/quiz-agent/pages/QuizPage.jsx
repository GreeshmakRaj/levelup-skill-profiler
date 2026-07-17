import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import QuizRunner from '../components/QuizRunner'
import { AlertCircle } from 'lucide-react'


const MODULE_TO_ASSESSMENT = {
  'mod_01': 'asmt-01',
  'mod_02': 'asmt-02',
  'mod_03': 'asmt-03',
}

export default function QuizPage() {
  const navigate = useNavigate()
  const { quiz_id, assessment_id } = useParams()
  const [searchParams] = useSearchParams()

  const paramId = assessment_id || quiz_id
  const moduleId = searchParams.get('module_id')

  // Resolve assessment ID
  let resolvedAssessmentId = null
  if (paramId) {
    resolvedAssessmentId = paramId
  } else if (moduleId) {
    resolvedAssessmentId = MODULE_TO_ASSESSMENT[moduleId] || null
  }

  const location = useLocation()
  const course = location.state?.course

  const [assessmentInfo, setAssessmentInfo] = useState(course || null)
  const [infoLoading, setInfoLoading] = useState(!course && !!resolvedAssessmentId)

  // Adjust state during render if resolvedAssessmentId changes
  const [prevResolvedId, setPrevResolvedId] = useState(resolvedAssessmentId)
  if (resolvedAssessmentId !== prevResolvedId) {
    setPrevResolvedId(resolvedAssessmentId)
    if (!course) {
      setInfoLoading(!!resolvedAssessmentId)
    }
  }

  useEffect(() => {
    if (course) return // Already have the course from state
    if (!resolvedAssessmentId) return

    // Fallback if accessed directly without state
    const timer = setTimeout(() => {
      setAssessmentInfo({
        assessment_id: resolvedAssessmentId,
        course_name: 'GenAI Course Assessment',
        module_name: null,
        topics: [],
        difficulty: 'Intermediate',
      })
      setInfoLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [resolvedAssessmentId, course])

  // Center error screen if neither assessment ID nor module ID was successfully resolved
  if (!resolvedAssessmentId) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50/30 p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-base font-bold text-ink">Invalid Link</h3>
          <p className="mt-2 text-sm text-muted">
            Invalid assessment link. Please return to your dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-primary mt-6"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (infoLoading) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-500" />
        <span className="mt-4 text-sm font-semibold text-muted">Loading your assessment...</span>
      </div>
    )
  }

  return (
    <div className="w-full bg-card p-6">
      <QuizRunner
        assessmentId={resolvedAssessmentId}
        assessmentInfo={assessmentInfo}
        onBackToDashboard={() => navigate('/quiz')}
      />
    </div>
  )
}


