import { Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ProtectedRoute({ children, roles }) {
  const { user, role, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/auth" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}

export function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}
