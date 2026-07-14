import { useEffect, useState } from 'react'
import useQuiz from '../hooks/useQuiz'
import QuestionDisplay from './QuestionDisplay'
import QuestionsList from './QuestionsList'
import QuizResult from './QuizResult'
import { AlertCircle, ChevronLeft } from 'lucide-react'

export default function QuizRunner({
  assessmentId,
  assessmentInfo,
  onBackToDashboard,
}) {
  const {
    phase,
    questions,
    currentIndex,
    answers,
    result,
    error,
    startQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    setCurrentIndex,
  } = useQuiz(assessmentId)

  const topics = Array.isArray(assessmentInfo?.topics) ? assessmentInfo.topics : []
  const [selectedTopics, setSelectedTopics] = useState([])

  useEffect(() => {
    setSelectedTopics(topics)
  }, [assessmentId, assessmentInfo])

  function toggleTopic(topic) {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((item) => item !== topic)
        : [...current, topic],
    )
  }

  function handleStartQuiz() {
    if (topics.length > 0 && selectedTopics.length === 0) return
    startQuiz()
  }

  // Full screen loading or submit spinners
  if (phase === 'loading' && !error) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-500" />
        <span className="mt-4 text-sm font-semibold text-muted">Loading your assessment...</span>
      </div>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-500" />
        <span className="mt-4 text-sm font-semibold text-muted">Submitting your answers...</span>
      </div>
    )
  }

  // Full-screen loading error
  if (phase === 'loading' && error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50/30 p-6 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-base font-bold text-ink">Failed to Load Assessment</h3>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={onBackToDashboard}
            className="btn-primary mt-6"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // INTRO PHASE
  if (phase === 'intro') {
    const courseName = assessmentInfo?.course_name || 'Assessment'
    const canStart = topics.length === 0 || selectedTopics.length > 0

    return (
      <div className="relative flex h-full items-center justify-center p-6">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Quiz Dashboard
        </button>
        <div className="card w-full max-w-[480px]">
          <h1 className="text-xl font-extrabold tracking-tight text-ink">
            {courseName}
          </h1>

          <div className="mt-6 border-y border-line py-4">
            <p className="text-xs text-muted">Select the topics you completed before taking this assessment.</p>

            {topics.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {topics.map((topic) => {
                  const checked = selectedTopics.includes(topic)
                  return (
                    <label
                      key={topic}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${checked
                        ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-400'
                        : 'border-line bg-card text-ink hover:bg-surface'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(topic)}
                        className="h-4 w-4 rounded border-line text-brand-500 focus:ring-brand-500"
                      />
                      <span className="font-medium">{topic}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted">
                No topics are available for this assessment yet.
              </p>
            )}
          </div>

          <p className="mt-6 text-xs text-muted leading-normal">
            Note: Once started, answer all questions before submitting.
          </p>

          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={!canStart}
            className="btn-primary mt-6 w-full"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  // ACTIVE PHASE - side-by-side layout
  if (phase === 'active') {
    const activeQuestion = questions[currentIndex]
    const currentAnswer = activeQuestion ? answers[activeQuestion.question_id] : null

    return (
      <div className="flex gap-5 py-4 h-[calc(100vh-160px)]">
        {/* Left: question card - takes remaining space */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto pr-2">
          <QuestionDisplay
            key={activeQuestion?.question_id}
            question={activeQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            currentAnswer={currentAnswer}
            onAnswer={answerQuestion}
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />
        </div>

        {/* Right: questions list panel - fixed width */}
        <div className="w-52 shrink-0 h-full overflow-hidden">
          <QuestionsList
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelect={(idx) => setCurrentIndex(idx)}
          />
        </div>
      </div>
    )
  }

  // RESULT PHASE
  if (phase === 'result') {
    return (
      <div className="py-6">
        <QuizResult
          result={result}
          assessmentInfo={assessmentInfo}
          questions={questions}
          onBackToDashboard={onBackToDashboard}
        />
      </div>
    )
  }

  return null
}

