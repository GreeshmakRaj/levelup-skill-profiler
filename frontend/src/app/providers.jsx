'use client'
import { ThemeProvider } from '@global/hooks/useTheme'
import { AuthProvider } from '@global/hooks/useAuth'
import { ToastProvider } from '@global/components/Toast'

// Wraps the entire app in context providers. Must be a Client Component
// because the providers rely on React state and effects.
export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
