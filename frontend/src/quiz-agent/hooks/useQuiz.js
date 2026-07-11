import { useState, useEffect } from 'react'
import { mockQuestions } from '../mockData'

// TEMP DEMO MODE: reading from mockData.js instead of the real API.
// Revert to useQuizApi() once VITE_QUIZ_API_URL and auth are ready.

// DEMO: scoring is illustrative only, real grading happens server-side.
const DEMO_CORRECT_ANSWERS = {
  'q-546b29e3': 'c', // tuple is immutable
  'q-a453ae76': 'b', // order guaranteed since 3.6
  'q-018352b5': 'a', // singleton = one instance
  'q-d612fc9e': 'c', // abstract factory
  'q-967be8ff': 'a', // else when condition becomes false
  'q-f7cb8a75': 'c', // range(len(sequence))
  'q-d18a5635': 'a', // same name, different params allowed in Python
  'q-d10ea9f0': 'b', // __init__ initializes attributes
  'q-63c626c8': 'a', // True — functions are first-class
  'q-166bf70e': 'a', // list is mutable
}

/**
 * Transforms raw mock questions into the shape the components expect.
 */
function getMockQuestions(assessmentId) {
  const raw = mockQuestions[assessmentId] || []
  return raw.map((q) => ({
    question_id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    options: q.options, // object { a: "text", ... } — QuestionDisplay now handles this shape
    points: 10,
    hint: null,
    sequence_number: q.sequence_number,
  }))
}

export default function useQuiz(assessmentId) {
  const [phase, setPhase] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Adjust state during render when assessmentId changes
  const [prevId, setPrevId] = useState(assessmentId)
  if (assessmentId !== prevId) {
    setPrevId(assessmentId)
    setPhase('loading')
    setError(null)
  }

  useEffect(() => {
    if (!assessmentId) return

    // TEMP DEMO: simulate async fetch from mock data
    const timer = setTimeout(() => {
      try {
        const data = getMockQuestions(assessmentId)
        setQuestions(data)
        setPhase('intro')
      } catch (err) {
        setError(err?.message || 'Failed to load assessment questions.')
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [assessmentId])

  function startQuiz() {
    setPhase('active')
    setCurrentIndex(0)
    setError(null)
  }

  function answerQuestion(questionId, answer) {
    const question = questions.find((q) => q.question_id === questionId)
    if (!question) return

    setAnswers((prev) => {
      if (question.question_type === 'Multiple Select') {
        const currentList = prev[questionId] || []
        const newList = currentList.includes(answer)
          ? currentList.filter((item) => item !== answer)
          : [...currentList, answer]
        return { ...prev, [questionId]: newList }
      }

      // MCQ or Boolean — answer is the option key (e.g., "a", "b")
      return { ...prev, [questionId]: answer }
    })
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      submitQuiz()
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  function submitQuiz() {
    setPhase('submitting')
    setError(null)

    // Answers are already stored as option keys (e.g., "a", "b") — no conversion needed.
    const formattedAnswers = questions.map((q) => ({
      question_id: q.question_id,
      submitted_answer: answers[q.question_id] ?? null,
    }))

    // TEMP DEMO: simulate async submit with mock scoring
    setTimeout(() => {
      try {
        // DEMO: scoring is illustrative only, real grading happens server-side.
        const responses = formattedAnswers.map((a, i) => {
          const correctKey = DEMO_CORRECT_ANSWERS[a.question_id]
          const isCorrect = a.submitted_answer === correctKey
          const question = questions[i]
          return {
            response_id: `resp-${String(i + 1).padStart(2, '0')}`,
            question_id: a.question_id,
            submitted_answer: a.submitted_answer,
            is_correct: isCorrect,
            points_earned: isCorrect ? (question?.points ?? 10) : 0,
            correct_answer: correctKey && question?.options ? question.options[correctKey] : null,
            ai_feedback: isCorrect
              ? 'Correct! Well done.'
              : 'Incorrect. Review this topic and try again.',
          }
        })

        const score = responses.filter((r) => r.is_correct).length
        const totalQuestions = questions.length
        const passFailStatus = score >= Math.ceil(totalQuestions * 0.6) ? 'Pass' : 'Fail'

        setResult({
          assessment_id: assessmentId,
          status: 'Completed',
          evaluation: {
            evaluation_id: 'eval-demo-01',
            score,
            total_questions: totalQuestions,
            pass_fail_status: passFailStatus,
            evaluated_at: new Date().toISOString(),
          },
          responses,
        })
        setPhase('result')
      } catch (err) {
        setError(err?.message || 'Failed to submit assessment. Please try again.')
        setPhase('active')
      }
    }, 500)
  }

  function retakeQuiz() {
    setAnswers({})
    setCurrentIndex(0)
    setResult(null)
    setError(null)
    setPhase('intro')
  }

  return {
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
    submitQuiz,
    retakeQuiz,
  }
}
