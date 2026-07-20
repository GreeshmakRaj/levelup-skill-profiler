import { Route } from 'react-router-dom'
import { ROLES } from './constants/roles'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import LearningPaths from './pages/LearningPaths'
import { ProtectedRoute, PublicRoute } from './routeGuards'

/**
 * Team 1 (skill-profiler-agent) route definitions.
 * Consumed by the shared src/App.jsx — does NOT own BrowserRouter or providers.
 */
export default function skillProfilerRoutes() {
  return (
    <>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/learning-paths"
          element={
            <ProtectedRoute roles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
              <LearningPaths />
            </ProtectedRoute>
          }
        />
      </Route>
    </>
  )
}
