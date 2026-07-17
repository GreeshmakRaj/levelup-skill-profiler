import { Route } from 'react-router-dom'
import QuizDashboardPage from './pages/QuizDashboardPage'
import QuizPage from './pages/QuizPage'
import AttemptHistoryPage from './pages/AttemptHistoryPage'
import Layout from '../skill-profiler-agent/components/layout/Layout'
import { ProtectedRoute } from '../skill-profiler-agent/routeGuards'

/**
 * Team 4 (quiz-agent) route definitions.
 * Consumed by the shared src/App.jsx — does NOT own BrowserRouter or providers.
 */
export default function quizRoutes() {
  return (
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/assessment" element={<QuizDashboardPage />} />
      <Route path="/assessment/:quiz_id" element={<QuizPage />} />
      <Route path="/assessment/:quiz_id/attempts" element={<AttemptHistoryPage />} />
      <Route path="/assessment/:quiz_id/history" element={<AttemptHistoryPage />} />
    </Route>
  )
}
