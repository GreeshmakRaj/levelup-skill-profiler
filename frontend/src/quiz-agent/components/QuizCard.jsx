import { useNavigate } from 'react-router-dom'
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

function getProgressWidth(score, total) {
  if (!total || score <= 0) {
    return 'w-0'
  }

  const ratio = score / total

  if (ratio >= 1) {
    return 'w-full'
  }

  if (ratio >= 0.8) {
    return 'w-4/5'
  }

  if (ratio >= 0.6) {
    return 'w-3/5'
  }

  if (ratio >= 0.4) {
    return 'w-2/5'
  }

  return 'w-1/5'
}

export default function QuizCard({ course, onStart }) {
  const navigate = useNavigate()
  const actionState = getActionState(course)
  const evaluation = course?.evaluation || {}
  const score = evaluation.score
  const totalQuestions = evaluation.total_questions || course?.question_count || 0
  const hasScore = score !== null && score !== undefined
  const progressColor = evaluation.pass_fail_status === 'Pass' ? 'bg-green-500' : 'bg-red-500'

  return (
    <article className="card flex h-[168px] w-full max-w-[240px] flex-col justify-between !rounded-xl !p-4">
      <div>
        <div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink" title={course?.course_name}>
              {course?.course_name || 'Untitled Assessment'}
            </h2>
          </div>
        </div>

        <div className="mt-4">
          {hasScore && (
            <div>
              <div className="mb-2 text-xs font-semibold text-ink">
                Score: {score} / {totalQuestions}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div className={`h-full rounded-full ${progressColor} ${getProgressWidth(score, totalQuestions)}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center">
        <button
          type="button"
          onClick={() => onStart?.(course)}
          className={`w-full !py-2 text-sm ${actionState.variant}`}
        >
          {actionState.text}
        </button>
        {hasScore && (
          <button
            type="button"
            onClick={() => navigate(`/quiz/${course.course_id}/attempts`)}
            className="mt-1.5 text-xs cursor-pointer hover:underline focus:outline-none focus:ring-0 active:bg-transparent hover:bg-transparent bg-transparent shadow-none"
          >
            View attempt history &rarr;
          </button>
        )}
      </div>
    </article>
  )
}
