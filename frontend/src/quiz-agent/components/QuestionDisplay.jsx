import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'

const isMultiSelect = (type) => type === 'Multiple Select' || type === 'MSQ'

export default function QuestionDisplay({
  question,
  currentIndex,
  totalQuestions,
  currentAnswer,
  onAnswer,
  onNext,
  onPrev,
}) {
  const [showHint, setShowHint] = useState(false)
  const [localAnswer, setLocalAnswer] = useState(currentAnswer)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setLocalAnswer(currentAnswer)
    setShowHint(false)
  }, [question?.question_id, currentAnswer])

  if (!question) return null

  const { question_id, question_text, question_type, options, hint } = question

  // Options arrive as an object { a: "text", b: "text", ... } from the backend.
  const optionEntries = Object.entries(options || {})

  // Selection state uses the option key ("a", "b", etc.), not the display text.
  const isSelected = (key) => {
    if (isMultiSelect(question_type)) {
      return Array.isArray(localAnswer) && localAnswer.includes(key)
    }
    return localAnswer === key
  }

  const handleOptionClick = (key) => {
    if (isMultiSelect(question_type)) {
      setLocalAnswer((prev) => {
        const currentList = Array.isArray(prev) ? prev : []
        return currentList.includes(key)
          ? currentList.filter((item) => item !== key)
          : [...currentList, key]
      })
    } else {
      setLocalAnswer(key)
    }
  }

  const handleNext = async () => {
    if (currentIndex === totalQuestions - 1) {
      if (isSubmitting) return
      setIsSubmitting(true)
      onAnswer(question_id, localAnswer)
      await onNext()
      // Note: we don't necessarily need setIsSubmitting(false) here because the component
      // unmounts when the phase changes to 'submitting', but we do it to be safe.
      setIsSubmitting(false)
    } else {
      onAnswer(question_id, localAnswer)
      onNext()
    }
  }

  const handlePrev = () => {
    onAnswer(question_id, localAnswer)
    onPrev()
  }

  return (
    <div className="card mx-auto w-full max-w-[680px] !p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span
          className={`chip border text-[11px] py-0.5 px-2 ${question_type === 'MCQ'
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : isMultiSelect(question_type)
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-teal-50 text-teal-700 border-teal-200'
            }`}
        >
          {question_type}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-2 h-1 w-full rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <h2 className="mt-3 text-base font-bold text-ink leading-snug">
        {question_text}
      </h2>

      {/* Hint Logic */}
      {isMultiSelect(question_type) ? (
        <div className="mt-1.5 text-xs font-medium text-brand-500">
          Select all that apply.
        </div>
      ) : (
        hint && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink transition-colors"
            >
              {showHint ? (
                <>
                  <EyeOff className="h-3 w-3" />
                  <span>Hide hint</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  <span>Show hint</span>
                </>
              )}
            </button>
            {showHint && (
              <div className="mt-1.5 rounded-lg border border-yellow-100 bg-yellow-50/50 p-2.5 text-xs text-yellow-800 transition-all duration-200">
                {hint}
              </div>
            )}
          </div>
        )
      )}

      {/* Answer Options */}
      <div className="mt-3">
        {question_type === 'Boolean' ? (
          /* Boolean questions also receive options as object, e.g. { a: "True", b: "False" } */
          <div className="flex gap-3">
            {optionEntries.map(([key, text]) => {
              const selected = isSelected(key)
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleOptionClick(key)}
                  className={`flex-1 rounded-lg py-3 text-center text-sm font-semibold transition-all border ${selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'bg-card border-line text-ink hover:bg-surface hover:border-faint'
                    }`}
                >
                  {text}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {optionEntries.map(([key, text]) => {
              const selected = isSelected(key)
              const displayLetter = key.toUpperCase()
              const isBox = isMultiSelect(question_type)

              return (
                <div
                  key={key}
                  onClick={() => handleOptionClick(key)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:bg-surface/50 ${selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-line bg-card hover:border-faint'
                    }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold transition-all ${isBox ? 'rounded-lg' : 'rounded-full'
                      } ${selected
                        ? 'border-brand-500 bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
                        : 'border-faint bg-card text-muted'
                      }`}
                  >
                    {displayLetter}
                  </div>
                  <span
                    className={`text-sm font-medium ${selected ? 'text-brand-700 dark:text-brand-400' : 'text-ink'
                      }`}
                  >
                    {text}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="btn-secondary !py-1.5 !px-3 !text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
        ) : (
          <div />
        )}
        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`btn-primary !py-1.5 !px-3 !text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary !py-1.5 !px-3 !text-sm"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
