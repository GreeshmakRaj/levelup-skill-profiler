import { useEffect, useState, memo } from 'react'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import useQuiz from '../hooks/useQuiz'
import QuestionDisplay from './QuestionDisplay'
import QuestionsList from './QuestionsList'
import QuizResult from './QuizResult'
import { AlertCircle, ChevronLeft } from 'lucide-react'
import { SubtopicFilter } from './SubtopicFilter'

const QuizRunner = memo(function QuizRunner({
  assessmentId,
  assessmentInfo,
  onBackToDashboard,
}) {
  const { user } = useAuth()
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
    retakeQuiz,
    reviewData,
  } = useQuiz(assessmentId)
  const SUBTOPICS = assessmentInfo?.topics || []
  const [selectedTopics, setSelectedTopics] = useState(SUBTOPICS)
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
    const canStart = SUBTOPICS.length === 0

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
          <p className="mt-1 text-sm text-muted">
            {/* {moduleName ? `${moduleName}` : '—'} */}
          </p>

          <div className="mt-6 border-y border-line py-3">
            <SubtopicFilter
              subtopics={SUBTOPICS}
              onChange={(selected) => setSelectedTopics(selected)}
            />

          </div>

          <p className="mt-6 text-xs text-muted leading-normal">
            Note: Once started, answer all questions before submitting.
          </p>

          <button
            type="button"
            onClick={() => {
              const payload = {
                user_id: user?.id,
                course_id: assessmentInfo.course_id,
                course_name: assessmentInfo.course_name,
                module_id: assessmentInfo.module_id || null,
                module_name: assessmentInfo.module_name || null,
                topic_selection_type: "all_topics",
                topics: selectedTopics,
                difficulty: assessmentInfo.difficulty
              }
              console.log('Payload being sent:', payload)
              startQuiz(payload)
            }}
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
          reviewData={reviewData}
          assessmentInfo={assessmentInfo}
          questions={questions}
          onRetake={retakeQuiz}
          onBackToDashboard={onBackToDashboard}
        />
      </div>
    )
  }

  return null
})

export default QuizRunner
