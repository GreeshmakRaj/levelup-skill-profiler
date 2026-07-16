import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { ROLES } from './constants/roles'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import LearningPaths from './pages/LearningPaths'
import RoadMapList from '../roadmaps/pages/RoadMapList'

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/auth" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const auth = useAuth()
  const user = auth?.user ?? null
  const loading = auth?.loading ?? false
  if (loading) return <FullScreenLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AuthGuard({ children }) {
  const auth = useAuth()
  const user = auth?.user ?? null
  const loading = auth?.loading ?? false
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      window.location.href = '/auth'
    }
  }, [user, loading, location.pathname])

  if (loading) return <FullScreenLoader />
  if (!user && location.pathname !== '/auth') return <FullScreenLoader />
  return children
}

function RouteTransition({ children }) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => setIsTransitioning(false), 200)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (isTransitioning) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <RouteTransition>
            <ToastProvider>
              <Routes>
                <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />

                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
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
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ToastProvider>
          </RouteTransition>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  )
}
