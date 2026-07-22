import { useEffect, useState } from 'react'
import { useQuizApi } from '../api/quizClient'

export default function AssessmentDetailedReviewModal({ assessmentId, onClose }) {
  const [reviewData, setReviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        const api = useQuizApi()
        const res = await api.getReview(assessmentId)
        setReviewData(res)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch review:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (assessmentId) {
      fetchReview()
    }
  }, [assessmentId])

  // Calculate metrics from answers array
  const calculateMetrics = (reviewData) => {
    if (!reviewData?.answers) return { answered: 0, correct: 0, wrong: 0 }
    
    const answered = reviewData.answers.filter(a => a.submitted_answer && a.submitted_answer.length > 0).length
    const correct = reviewData.answers.filter(a => a.is_correct).length
    const wrong = answered - correct
    
    return { answered, correct, wrong }
  }

  const metrics = reviewData ? calculateMetrics(reviewData) : {}

  const getOptionText = (answer) => {
    if (!answer?.submitted_answer || !answer?.options) return '—'
    return answer.submitted_answer.map(key => answer.options[key] || key).join(', ')
  }

  const getCorrectAnswerText = (answer) => {
    const correct = answer?.correct_answer || answer?.correct_answer_list || []
    if (!answer?.options) return correct.join(', ')
    return correct.map(key => answer.options[key] || key).join(', ')
  }

  if (!assessmentId) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col !rounded-xl bg-surface">
        {/* Sticky header - no padding on wrapper, full width */}
        <div className="sticky top-0 z-20 bg-surface border-b border-line px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Assessment Review</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-background rounded-lg transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-muted text-sm py-6 text-center">Loading review details...</p>
          ) : error ? (
            <p className="text-red-600 text-sm py-6 text-center">Error: {error}</p>
          ) : reviewData ? (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="border border-line rounded-lg p-3 bg-card">
                  <p className="text-xs text-muted">Total Questions</p>
                  <p className="text-lg font-bold text-ink">{reviewData.total_questions || 0}</p>
                </div>
                <div className="border border-line rounded-lg p-3 bg-card">
                  <p className="text-xs text-muted">Answered</p>
                  <p className="text-lg font-bold text-ink">{metrics.answered || 0}</p>
                </div>
                <div className="border border-line rounded-lg p-3 bg-card">
                  <p className="text-xs text-muted">Correct</p>
                  <p className="text-lg font-bold text-green-600">{metrics.correct || 0}</p>
                </div>
                <div className="border border-line rounded-lg p-3 bg-card">
                  <p className="text-xs text-muted">Wrong</p>
                  <p className="text-lg font-bold text-red-600">{metrics.wrong || 0}</p>
                </div>
              </div>

              {/* Score and status */}
              <div className="border border-line rounded-lg p-3 bg-card">
                <p className="text-sm font-semibold text-ink">Score: {reviewData.score} / {reviewData.total_questions}</p>
                <p className={`text-sm font-semibold mt-1 ${reviewData.pass_fail_status === 'pass' || reviewData.pass_fail_status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {reviewData.pass_fail_status?.toUpperCase() || ''}
                </p>
              </div>

              {/* Question Breakdown */}
              {reviewData.answers && reviewData.answers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-ink mb-3">Question Breakdown</h3>
                  <div className="space-y-2 pb-4">
                    {reviewData.answers.map((answer, idx) => (
                      <div key={answer.question_id || idx} className="border border-line rounded p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${answer.is_correct ? 'bg-green-600' : 'bg-red-600'}`}></div>
                          <p className="text-xs font-semibold text-ink">Q{idx + 1}: {answer.question_text}</p>
                        </div>
                        
                        <p className="text-xs text-muted mb-2">
                          Your answer: <span className="text-ink font-semibold">{getOptionText(answer) || '—'}</span>
                        </p>
                        
                        {!answer.is_correct && (
                          <p className="text-xs text-muted">
                            Correct answer: <span className="text-green-600 font-semibold">{getCorrectAnswerText(answer)}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted text-sm py-6 text-center">No review data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
