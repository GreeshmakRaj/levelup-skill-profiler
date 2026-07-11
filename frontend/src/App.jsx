import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './skill-profiler-agent/hooks/useAuth'
import { ToastProvider } from './skill-profiler-agent/components/ui/Toast'
import skillProfilerRoutes from './skill-profiler-agent/routes'
import quizRoutes from './quiz-agent/routes'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {skillProfilerRoutes()}
            {quizRoutes()}

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
