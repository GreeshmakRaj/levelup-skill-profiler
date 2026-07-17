import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./skill-profiler-agent/hooks/useAuth";
import { ToastProvider } from "./skill-profiler-agent/components/ui/Toast";
import { ROLES } from "./skill-profiler-agent/constants/roles";
import Layout from "./skill-profiler-agent/components/layout/Layout";
import AuthPage from "./skill-profiler-agent/pages/AuthPage";
import Dashboard from "./skill-profiler-agent/pages/Dashboard";
import LearningPaths from "./skill-profiler-agent/pages/LearningPaths";
import RoadMapList from "./roadmaps/pages/RoadMapList";
import AiTutor from './ai-tutor/pages/AiTutor'
import quizRoutes from './quiz-agent/routes'
import QuizDashboardPage from './quiz-agent/pages/QuizDashboardPage'

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <AuthPage />
                </PublicRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-tutor" element={<AiTutor />} />
              <Route path="/assessment" element={<QuizDashboardPage/>}/>
              <Route
                path="/learning-paths"
                element={
                  <ProtectedRoute roles={[ROLES.MANAGER, ROLES.EMPLOYEE]}>
                    <LearningPaths />
                  </ProtectedRoute>
                }
              />
              <Route path="/roadmaps-list" element={<RoadMapList />} />
            </Route>
                
            {/* Quiz routes — owns its own Layout + ProtectedRoute wrapper */}
            {quizRoutes()}

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
