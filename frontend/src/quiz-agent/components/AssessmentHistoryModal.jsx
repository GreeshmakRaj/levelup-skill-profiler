import { useState, useEffect } from 'react'
import { useQuizApi } from '../api/quizClient'
import AssessmentDetailedReviewModal from './AssessmentDetailedReviewModal'

export default function AssessmentHistoryModal({
  courseId,
  courseName,
  userId,
  onClose
}) {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAttemptId, setSelectedAttemptId] = useState(null)

  useEffect(() => {
    console.log('Modal received userId:', userId, 'courseId:', courseId)
    const fetchAssessments = async () => {
      try {
        setLoading(true)
        const api = useQuizApi()
        const res = await api.getDetailedResults(userId)
        console.log('Raw API response:', res)
        
        // New API returns { attempts: [...], pagination: {...} }
        const attemptsList = res.attempts || []
        
        console.log('Fetched attempts:', attemptsList)
        setAssessments(attemptsList)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch assessments:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (userId && courseId) {
      fetchAssessments()
    }
  }, [userId, courseId])

  if (!courseId) return null

  // Filter for the selected course
  const courseAssessments = assessments
    .filter(a => a.course_id === courseId)

  console.log('All assessments:', assessments)
  console.log('Filtered for course:', courseId, courseAssessments)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card w-full max-w-2xl flex flex-col max-h-[80vh] !rounded-xl !p-6">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between mb-4 pb-3 border-b border-line bg-card">
          <h2 className="text-lg font-bold text-ink">{courseName} — Attempt History</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-surface rounded-lg transition"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <p className="text-muted text-sm py-6 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-sm py-6 text-center">Error: {error}</p>
        ) : courseAssessments.length === 0 ? (
          <p className="text-muted text-sm py-6 text-center">No attempts yet</p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {courseAssessments.map((assessment, idx) => (
              <div 
                key={assessment.assessment_id} 
                onClick={() => setSelectedAttemptId(assessment.assessment_id)}
                className="border border-line rounded-lg p-3 mb-2 cursor-pointer hover:bg-surface/50 transition-colors"
              >
                {/* Top: Attempt # and Status badge */}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-semibold text-ink">Attempt {courseAssessments.length - idx}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                    assessment.status === 'pass' 
                      ? 'bg-green-200 text-green-900 dark:bg-green-900/30 dark:text-green-400' 
                      : assessment.status === 'pending'
                      ? 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </span>
                </div>
                
                {/* Assessment ID */}
                <p className="text-xs text-muted mb-2">Assessment ID: {assessment.assessment_id}</p>
                
                {/* Score - Use 'score' instead of 'last_score' */}
                <div className="text-xs text-muted flex justify-between">
                  <div>Score: <span className="text-ink font-semibold">{assessment.score !== null ? assessment.score : '—'}</span></div>
                  <div>Attempted: <span className="text-ink font-semibold">{assessment.attempted_on ? new Date(assessment.attempted_on).toLocaleDateString() : '—'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAttemptId && (
        <AssessmentDetailedReviewModal
          assessmentId={selectedAttemptId}
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </div>
  )
}
