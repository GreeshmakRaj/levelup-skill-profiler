import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function QuizResult({
  result,
  assessmentInfo,
  questions,
  onBackToDashboard,
}) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  if (!result) return null

  const score = result?.score ?? 0
  const totalQuestions = result?.total_questions ?? 0
  const isPass = result?.pass_fail_status === 'Pass'
  const answers = result?.answers ?? []


  // Map question_id to question object for text & points lookup
  const questionMap = Object.fromEntries(
    (questions || []).map((q) => [q.question_id, q])
  )

  const courseName = assessmentInfo?.course_name || 'Assessment'
  const moduleName = assessmentInfo?.module_name || 'Module Quiz'
  const responseReview  = [];


  return (
    <div className="card mx-auto w-full max-w-[520px] !p-5">
      {/* Top Section - Score Summary */}
      <div className="text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[3px] text-2xl font-extrabold shadow-sm ${isPass
              ? 'border-green-500 text-green-600 bg-green-50/20'
              : 'border-red-500 text-red-600 bg-red-50/20'
            }`}
        >
          {score} / {totalQuestions}
        </div>

        <h2
          className={`mt-3 text-xl font-bold tracking-tight ${isPass ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {isPass ? 'Passed!' : 'Failed'}
        </h2>

        <h1 className="mt-1.5 text-base font-bold text-ink">{courseName}</h1>
        {moduleName && <p className="mt-1 text-xs text-muted">{moduleName}</p>}
        

      </div>

      {/* Middle Section - Question Breakdown */}
      {showBreakdown && (
        <div className="mt-8">
          <h3 className="border-b border-line pb-3 text-base font-bold text-ink">
            Question Breakdown
          </h3>

        <div className="mt-4 divide-y divide-line">
          {answers.map((singAnswer, index) => {
            const questionObj = questionMap[singAnswer.question_id]
            // const displayAnswerKey =  singAnswer.correct_answer
            // displayAnswerKey.map((ele) =>{
            //   responseReview.push(singAnswer.options[ele])
            // })
            // console.log(responseReview)
            const correct_answer_list = singAnswer?.correct_answer_list
            console.log(correct_answer_list)
            

            return (
              <div key={singAnswer.question_id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0">
                      {singAnswer.is_correct ? (
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
                        <p className="mt-1 text-xs text-ink leading-relaxed">
                          {questionObj.question_text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Correct Answer Reveal */}
                <div className="mt-4 flex flex-col items-start">
                  <h4 className="text-sm font-bold text-ink">Correct answer:</h4>
                  {correct_answer_list && (
                    <ul className="ml-8 mt-2 list-disc">
                      {correct_answer_list.map((ele, index) => (
                        <li key={index} className="text-xs font-semibold text-green-600">
                          {ele}
                        </li>
                      ))}
                    </ul>
                  )}
</div>
              </div>
            )
          })}
        </div>
      </div>
      )}

      {/* Bottom Section - Action Buttons */}
      <div className="mt-5 flex justify-center border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="btn-primary w-auto min-w-[150px] !px-5 !py-1.5 text-sm"
        >
          {showBreakdown ? "Hide Breakdown" : "Show Breakdown"}
        </button>
      </div>
    </div>
  )
}





