'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@global/hooks/useAuth'
import AppLayout from '@layouts/Layout'

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Route-group layout that protects every page under (protected)/.
// Unauthenticated users are redirected to /auth.
export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth')
    }
  }, [user, loading, router])

  if (loading || !user) return <FullScreenLoader />

  return <AppLayout>{children}</AppLayout>
}
