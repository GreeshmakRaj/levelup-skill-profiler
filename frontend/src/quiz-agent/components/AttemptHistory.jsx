export default function AttemptHistory({ attempt, attemptNumber, isBest }) {
  const { score, total_questions, pass_fail_status, submitted_at, evaluated_at, ai_feedback, feedback } = attempt

  // Format dates with vanilla JS Date
  const submittedDateStr = submitted_at
    ? new Date(submitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const submittedTimeStr = submitted_at
    ? new Date(submitted_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : ''
  const submittedText = submitted_at ? `Submitted: ${submittedDateStr}, ${submittedTimeStr}` : '—'

  const evaluatedDateStr = evaluated_at
    ? new Date(evaluated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : ''
  const evaluatedTimeStr = evaluated_at
    ? new Date(evaluated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : ''
  const evaluatedText = evaluated_at ? `${evaluatedDateStr}, ${evaluatedTimeStr}` : 'Pending'

  const isPass = pass_fail_status === 'Pass'
  const scoreColor = isPass ? 'text-brand-500' : 'text-red-600'
  const progressBgColor = isPass ? 'bg-green-500' : 'bg-red-500'
  const borderLeftColor = isPass ? 'border-l-green-500' : 'border-l-red-500'
  const badgeColors = isPass
    ? 'chip bg-green-50 text-green-700 border border-green-100'
    : 'chip bg-red-50 text-red-700 border border-red-100'

  const progressPercent = total_questions ? Math.round((score / total_questions) * 100) : 0
  const displayFeedback = feedback || ai_feedback

  return (
    <div className={`card flex w-full flex-row border-l-4 ${borderLeftColor}`}>
      <div className="flex flex-1 flex-col pr-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink">Attempt #{attemptNumber}</span>
          {isBest && (
            <span className="chip bg-amber-100 text-amber-700">
              ⭐ Best
            </span>
          )}
        </div>
        <div className={`mt-2 flex items-baseline gap-2 text-3xl font-bold ${scoreColor}`}>
          {score} / {total_questions}
          <span className="text-sm font-medium text-muted">· {progressPercent}%</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface">
          <div className={`h-full rounded-full ${progressBgColor}`} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-4 text-sm text-ink">{submittedText}</div>
        {displayFeedback && <div className="mt-2 text-sm italic text-muted">{displayFeedback}</div>}
      </div>

      <div className="flex w-32 shrink-0 flex-col items-end justify-start border-l border-line pl-4 text-right">
        <span className={badgeColors}>
          {pass_fail_status}
        </span>
        <div className="mt-3 text-xs text-muted">
          Evaluated at
          <br />
          {evaluatedText}
        </div>
      </div>
    </div>
  )
}
