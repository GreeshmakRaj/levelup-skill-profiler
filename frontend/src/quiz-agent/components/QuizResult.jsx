import { CheckCircle, XCircle } from 'lucide-react'

export default function QuizResult({
  result,
  assessmentInfo,
  questions,
  onBackToDashboard,
}) {
  if (!result) return null

  const { evaluation, responses } = result
  const score = evaluation?.score ?? 0
  const totalQuestions = evaluation?.total_questions ?? 0
  const isPass = evaluation?.pass_fail_status === 'Pass'

  // Map question_id to question object for text & points lookup
  const questionMap = Object.fromEntries(
    (questions || []).map((q) => [q.question_id, q])
  )

  const courseName = assessmentInfo?.course_name || 'Assessment'
  const moduleName = assessmentInfo?.module_name || 'Module Quiz'

  return (
    <div className="card mx-auto w-full max-w-[600px]">
      {/* Top Section - Score Summary */}
      <div className="text-center">
        <div
          className={`mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 text-3xl font-extrabold shadow-sm ${
            isPass
              ? 'border-green-500 text-green-600 bg-green-50/20'
              : 'border-red-500 text-red-600 bg-red-50/20'
          }`}
        >
          {score} / {totalQuestions}
        </div>

        <h2
          className={`mt-4 text-2xl font-bold tracking-tight ${
            isPass ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {isPass ? 'Passed!' : 'Failed'}
        </h2>

        <h1 className="mt-2 text-lg font-bold text-ink">{courseName}</h1>
        {moduleName && <p className="mt-1 text-sm text-muted">{moduleName}</p>}
      </div>

      {/* Middle Section - Question Breakdown */}
      <div className="mt-8">
        <h3 className="border-b border-line pb-3 text-base font-bold text-ink">
          Question Breakdown
        </h3>

        <div className="mt-4 divide-y divide-line">
          {responses.map((resp, index) => {
            const questionObj = questionMap[resp.question_id]
            const totalPoints = questionObj?.points ?? 20
            const displayAnswer = Array.isArray(resp.correct_answer)
              ? resp.correct_answer.join(', ')
              : resp.correct_answer

            return (
              <div key={resp.response_id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      {resp.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-ink">
                        Question {index + 1}
                      </h4>
                      {questionObj?.question_text && (
                        <p className="mt-1 text-sm text-ink leading-relaxed">
                          {questionObj.question_text}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-muted">
                    {resp.points_earned} / {totalPoints} pts
                  </span>
                </div>

                {/* AI Feedback */}
                {resp.ai_feedback && (
                  <div className="ml-8 mt-2 rounded-lg bg-surface p-3 text-xs italic text-muted border border-line">
                    {resp.ai_feedback}
                  </div>
                )}

                {/* Correct Answer Reveal */}
                {displayAnswer && (
                  <div className="ml-8 mt-2 text-xs font-semibold text-green-600">
                    Correct answer: {displayAnswer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Section - Action Buttons */}
      <div className="mt-8 flex justify-center border-t border-line pt-6">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="btn-primary w-full max-w-[260px]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}


