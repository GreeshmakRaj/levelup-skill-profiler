import useQuiz from '../hooks/useQuiz'
import QuestionDisplay from './QuestionDisplay'
import QuestionsList from './QuestionsList'
import QuizResult from './QuizResult'
import { AlertCircle } from 'lucide-react'

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
    retakeQuiz,
  } = useQuiz(assessmentId)

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
    const moduleName = assessmentInfo?.module_name || '—'

    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="card w-full max-w-[480px]">
          <h1 className="text-xl font-extrabold tracking-tight text-ink">
            {courseName}
          </h1>
          <p className="mt-1 text-sm italic text-muted">
            {moduleName ? `${moduleName}` : '—'}
          </p>

          <div className="mt-6 border-y border-line py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted">Questions</span>
              <span className="font-bold text-ink">{questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted">Difficulty</span>
              <span className="font-bold text-ink">{assessmentInfo?.difficulty || 'Intermediate'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-muted">Passing Score</span>
              <span className="font-bold text-ink">60%</span>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted leading-normal">
            Note: Once started, answer all questions before submitting.
          </p>

          <button
            type="button"
            onClick={startQuiz}
            className="btn-primary mt-6 w-full"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  // ACTIVE PHASE — side-by-side layout
  if (phase === 'active') {
    const activeQuestion = questions[currentIndex]
    const currentAnswer = activeQuestion ? answers[activeQuestion.question_id] : null

    return (
      <div className="flex items-start gap-5 py-4">
        {/* Left: question card — takes remaining space */}
        <div className="flex-1 min-w-0">
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

        {/* Right: questions list panel — fixed width */}
        <div className="w-52 shrink-0 self-stretch">
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
          onRetake={retakeQuiz}
          onBackToDashboard={onBackToDashboard}
        />
      </div>
    )
  }

  return null
}
