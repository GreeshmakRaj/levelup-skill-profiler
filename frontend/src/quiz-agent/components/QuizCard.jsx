import { useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, Clock, XCircle } from 'lucide-react'

function getStatusBadge(assessment) {
  const status = assessment?.status
  const passFailStatus = assessment?.evaluation?.pass_fail_status

  if (passFailStatus === 'Pass' || status === 'Completed') {
    return {
      text: passFailStatus === 'Pass' ? 'Passed' : 'Completed',
      className: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    }
  }

  if (passFailStatus === 'Fail') {
    return {
      text: 'Failed',
      className: 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700',
      icon: <XCircle className="w-3.5 h-3.5" />,
    }
  }

  if (status === 'In Progress') {
    return {
      text: 'In Progress',
      className: 'text-sm font-medium text-amber-600 whitespace-nowrap inline-block',
      icon: null,
    }
  }

  return {
    text: 'Not Started',
    className: 'text-sm text-muted whitespace-nowrap inline-block',
    icon: null,
  }
}

function getDifficultyDot(difficulty) {
  if (difficulty === 'Intermediate') {
    return 'bg-yellow-500'
  }

  if (difficulty === 'Advanced') {
    return 'bg-red-500'
  }

  return 'bg-green-500'
}

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
  const statusBadge = getStatusBadge(assessment)
  const actionState = getActionState(assessment)
  const evaluation = assessment?.evaluation || {}
  const score = evaluation.score
  const totalQuestions = evaluation.total_questions || assessment?.question_count || 0
  const hasScore = score !== null && score !== undefined
  const progressColor = evaluation.pass_fail_status === 'Pass' ? 'bg-green-500' : 'bg-red-500'
  const topics = Array.isArray(assessment?.topics) ? assessment.topics : []
  const visibleTopics = topics.slice(0, 3)
  const hiddenTopicCount = Math.max(topics.length - visibleTopics.length, 0)

  return (
    <article className="card flex h-full flex-col justify-between">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-ink" title={assessment?.course_name}>
              {assessment?.course_name || 'Untitled Assessment'}
            </h2>
            <p className="mt-1 text-sm text-muted">{assessment?.module_name || '—'}</p>
          </div>
          <span className={statusBadge.className}>
            {statusBadge.icon}
            {statusBadge.text}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {visibleTopics.map((topic) => (
            <span key={topic} className="skill-pill">
              {topic}
            </span>
          ))}
          {hiddenTopicCount > 0 && (
            <span className="skill-pill">
              +{hiddenTopicCount} more
            </span>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <span className={`h-2.5 w-2.5 rounded-full ${getDifficultyDot(assessment?.difficulty)}`} />
            {assessment?.difficulty || 'Beginner'}
          </div>

          {hasScore && (
            <div>
              <div className="mb-2 text-sm font-semibold text-ink">
                Score: {score} / {totalQuestions}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <div className={`h-full rounded-full ${progressColor} ${getProgressWidth(score, totalQuestions)}`} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <button
          type="button"
          onClick={() => onStart?.(assessment)}
          className={`w-full ${actionState.variant}`}
        >
          {actionState.text}
        </button>
        {hasScore && (
          <button
            type="button"
            onClick={() => navigate(`/quiz/${assessment.assessment_id}/attempts`)}
            className="btn-ghost mt-3 text-sm"
          >
            View attempt history &rarr;
          </button>
        )}
      </div>
    </article>
  )
}
