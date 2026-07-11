import { CheckCircle, Circle } from 'lucide-react'

/**
 * Permanent right-side panel showing all questions with answered/unanswered status.
 */
export default function QuestionsList({ questions, answers, currentIndex, onSelect }) {
  const answeredCount = questions.filter((q) => {
    const a = answers[q.question_id]
    return a !== null && a !== undefined && (Array.isArray(a) ? a.length > 0 : true)
  }).length

  return (
    <div className="flex flex-col h-full rounded-xl border border-line bg-card overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-line bg-surface">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Questions</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-[11px] font-semibold text-muted whitespace-nowrap">
            {answeredCount}/{questions.length}
          </span>
        </div>
      </div>

      {/* Scrollable question rows */}
      <div className="flex-1 overflow-y-auto py-1">
        {questions.map((q, idx) => {
          const answer = answers[q.question_id]
          const isAnswered =
            answer !== null &&
            answer !== undefined &&
            (Array.isArray(answer) ? answer.length > 0 : true)
          const isActive = idx === currentIndex

          return (
            <button
              key={q.question_id}
              type="button"
              onClick={() => onSelect(idx)}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-left transition-colors ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/10'
                  : 'hover:bg-surface'
              }`}
            >
              {/* Status icon */}
              {isAnswered ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-500" strokeWidth={2} />
              ) : (
                <Circle
                  className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-faint'}`}
                  strokeWidth={2}
                />
              )}

              {/* Question label */}
              <span
                className={`text-sm leading-tight ${
                  isActive
                    ? 'font-semibold text-brand-700 dark:text-brand-400'
                    : isAnswered
                    ? 'font-medium text-ink'
                    : 'font-medium text-muted'
                }`}
              >
                Question {idx + 1}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
