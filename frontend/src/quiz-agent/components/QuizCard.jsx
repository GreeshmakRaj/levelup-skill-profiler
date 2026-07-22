import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Clock } from 'lucide-react'

function getActionState(course) {
  const status = course?.status
  const passFailStatus = course?.evaluation?.pass_fail_status

  if (status === 'Not Started') {
    return { text: 'Start Assessment', variant: 'btn-primary' }
  }

  if (status === 'In Progress') {
    return { text: 'Continue Assessment', variant: 'btn-primary' }
  }

  if (status === 'Completed' && passFailStatus === 'Pass') {
    return { text: 'Retake Assessment', variant: 'btn-secondary' }
  }

  return { text: 'Retake Assessment', variant: 'btn-primary' }
}

export default function QuizCard({ course, history, activeSession, onStart, onViewHistory }) {
  const navigate = useNavigate()
  const actionState = getActionState(course)

  // Determine if this card's course has an active session
  // Use courseId if available in session, fallback to matching assessmentId from history
  const isActiveCourse = !!activeSession && (
    activeSession.courseId
      ? activeSession.courseId === course?.course_id
      : activeSession.assessmentId === history?.latest_assessment_id
  )

  const hasActiveSession = !!activeSession
  const isDisabled = hasActiveSession && !isActiveCourse

  // Use history data if available, otherwise fall back to course evaluation
  const displayScore = history?.last_score ?? course?.evaluation?.score
  const displayStatus = history?.status ?? course?.evaluation?.pass_fail_status
  const attempts = history?.attempts ?? 0
  const totalQuestions = course?.question_count || 0

  const hasScore = displayScore !== null && displayScore !== undefined
  const hasData = attempts > 0 || hasScore || displayStatus

  return (
    <article className="card flex h-auto w-full max-w-[240px] flex-col justify-between !rounded-[8px] !p-4">
      <div>
        <div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink" title={course?.course_name}>
              {course?.course_name || 'Untitled Assessment'}
            </h2>

            {/* History summary - always reserve space */}
            <div className="mt-1 h-4 text-[11px] text-muted">
              {history ? (
                <>
                  Attempts: <span className="text-ink font-semibold">{history.attempts}</span> | Last Score: <span className="text-ink font-semibold">{history.last_score !== null ? history.last_score : '—'}/{course?.question_count || 10}</span>
                </>
              ) : (
                <span className="text-muted/50">No attempts yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1">
        <button
          type="button"
          onClick={() => {
            if (isActiveCourse) {
              navigate(`/assessment/${course.course_id}`)
            } else {
              onStart?.(course)
            }
          }}
          disabled={isDisabled && !isActiveCourse}
          className={`flex-1 !py-1 !px-1 text-xs btn-primary !rounded-[6px] flex items-center justify-center gap-1 ${(isDisabled && !isActiveCourse) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <Play className="w-4 h-4" />
          <span>{isActiveCourse ? 'Resume' : isDisabled ? 'In Progress' : 'Start'}</span>
        </button>
        <button
          type="button"
          onClick={() => onViewHistory?.(course)}
          disabled={isDisabled && !isActiveCourse}
          className={`flex-1 !py-1 !px-1 text-xs btn-secondary !rounded-[6px] flex items-center justify-center gap-1 ${(isDisabled && !isActiveCourse) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
          <Clock className="w-4 h-4" />
          <span>History</span>
        </button>
      </div>
    </article>
  )
}
