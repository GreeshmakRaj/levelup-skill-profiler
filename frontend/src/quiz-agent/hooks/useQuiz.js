import React, { useState, useEffect, useRef } from 'react'
import { useQuizApi } from '../api/quizClient'

export default function useQuiz(assessmentId) {
  const api = useQuizApi()
  const [currentAttemptId, setCurrentAttemptId] = useState(null)
  const [phase, setPhase] = useState('loading')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const isSubmittingRef = useRef(false)

  // Adjust state during render when assessmentId changes
  const [prevId, setPrevId] = useState(assessmentId)
  if (assessmentId !== prevId) {
    setPrevId(assessmentId)
    setPhase('loading')
    setError(null)
  }

  useEffect(() => {
    if (!assessmentId) return

    const savedSession = localStorage.getItem('quizSession')
    const savedAnswers = localStorage.getItem('quizAnswers')
    
    if (savedSession) {
      const session = JSON.parse(savedSession)
      setCurrentAttemptId(session.assessmentId)
      setQuestions(session.questions)
      setCurrentIndex(session.currentIndex || 0)
      setPhase('active')
      
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
      }
    } else {
      setPhase('intro')
    }
  }, [assessmentId])

  async function startQuiz(payload) {
    setPhase('loading')
    setError(null)
    
    try {
      const res = await api.takeAssessment(payload)
      const normalizedQuestions = (res.questions || []).map(q => ({
        ...q,
        question_id: q.id // Normalize for frontend
      }))
      setCurrentAttemptId(res.assessment_id)
      setQuestions(normalizedQuestions)
      setCurrentIndex(0)
      setPhase('active')
      
      localStorage.setItem('quizSession', JSON.stringify({
        assessmentId: res.assessment_id,
        courseId: payload.course_id,
        questions: normalizedQuestions,
        currentIndex: 0
      }))
    } catch (err) {
      setError(err?.message || 'Failed to start assessment.')
      setPhase('intro')
    }
  }

  function answerQuestion(questionId, answer) {
    const question = questions.find((q) => q.question_id === questionId)
    if (!question) return

    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: answer }
      localStorage.setItem('quizAnswers', JSON.stringify(updated))
      return updated
    })
  }

  function updateSessionIndex(newIndex) {
    const saved = localStorage.getItem('quizSession')
    if (saved) {
      const parsed = JSON.parse(saved)
      localStorage.setItem('quizSession', JSON.stringify({ ...parsed, currentIndex: newIndex }))
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => {
        const next = prev + 1
        updateSessionIndex(next)
        return next
      })
    } else {
      submitQuiz()
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => {
        const next = prev - 1
        updateSessionIndex(next)
        return next
      })
    }
  }

  async function submitQuiz() {
    if (isSubmittingRef.current) return
    isSubmittingRef.current = true

    setPhase('submitting')
    setError(null)

    // Save current session and remove it immediately to prevent resuming during submission
    const savedSession = localStorage.getItem('quizSession')
    localStorage.removeItem('quizSession')

    // Answers are already stored as option keys (e.g., "a", "b").
    // We must wrap them in an array for the backend.
    const formattedAnswers = questions.map((q) => {
      const ans = answers[q.question_id]
      return {
        question_id: q.question_id,
        submitted_answer: ans ? (Array.isArray(ans) ? ans : [ans]) : [],
      }
    })

    const payload = {
      assessment_id: currentAttemptId,
      answers: formattedAnswers
    }

    console.log('Submit payload:', payload)
    console.log('Submit payload JSON:', JSON.stringify(payload, null, 2))

    try {
      await api.submitAssessment(payload)
      const reviewRes = await api.getReview(currentAttemptId)
      setResult(reviewRes)
      setPhase('result')
      
      // Clear saved answers after successful completion (quizSession already cleared)
      localStorage.removeItem('quizAnswers')


    } catch (err) {
      // Restore session on failure so the user can retry
      if (savedSession) {
        localStorage.setItem('quizSession', savedSession)
      }
      setError(err?.message || 'Failed to submit assessment. Please try again.')
      setPhase('active')
    } finally {
      isSubmittingRef.current = false
    }
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


