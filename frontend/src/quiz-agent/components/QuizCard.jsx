import { useNavigate } from 'react-router-dom'
function getActionState(assessment) {
  const status = assessment?.status
  const passFailStatus = assessment?.evaluation?.pass_fail_status

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

export default function QuizCard({ assessment, onStart }) {
  const navigate = useNavigate()
  const actionState = getActionState(assessment)
  const evaluation = assessment?.evaluation || {}
  const score = evaluation.score
  const totalQuestions = evaluation.total_questions || assessment?.question_count || 0
  const hasScore = score !== null && score !== undefined
  const progressColor = evaluation.pass_fail_status === 'Pass' ? 'bg-green-500' : 'bg-red-500'

  return (
    <article className="card flex h-[168px] w-full max-w-[240px] flex-col justify-between !rounded-xl !p-4">
      <div>
        <div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink" title={assessment?.course_name}>
              {assessment?.course_name || 'Untitled Assessment'}
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
          onClick={() => onStart?.(assessment)}
          className={`w-full !py-2 text-sm ${actionState.variant}`}
        >
          {actionState.text}
        </button>
        {hasScore && (
          <button
            type="button"
            onClick={() => navigate(`/quiz/${assessment.assessment_id}/attempts`)}
            className="btn-ghost mt-1.5 text-xs"
          >
            View attempt history &rarr;
          </button>
        )}
      </div>
    </article>
  )
}




