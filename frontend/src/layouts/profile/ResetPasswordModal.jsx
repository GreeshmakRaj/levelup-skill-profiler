'use client'
import { useState } from 'react'
import { supabase } from '@global/services/supabase'
import { useToast } from '@/global/components/Toast'

export default function ResetPasswordModal({ open, onClose }) {
  const toast = useToast()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const close = () => {
    setPassword(''); setConfirm(''); setError(''); onClose()
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password.trim().length === 0) return setError('Password cannot be only spaces.')
    if (password !== confirm) return setError('Passwords do not match.')
    setLoading(true)
    try {
      // Update via the Supabase client so the current session stays valid
      // (the admin API would revoke the session and trigger a logout).
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      toast.success('Password updated successfully.')
      close()
    } catch (err) {
      const msg = (err?.message || '').toLowerCase()
      setError(
        msg.includes('different from the old')
          ? 'Choose a password different from your current one.'
          : msg.includes('weak') || msg.includes('at least')
          ? 'Please choose a stronger password.'
          : err?.message || 'Could not update password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => !loading && close()} />
      <form
        onSubmit={submit}
        className="relative bg-card rounded-2xl shadow-lift border border-line w-full max-w-sm p-6 animate-scaleIn"
      >
        <h3 className="font-semibold text-ink text-lg">Reset Password</h3>
        <p className="text-sm text-muted mt-1 mb-4">Choose a new password for your account.</p>

        <div className="space-y-4">
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="label">Confirm password</label>
            <input
              type="password"
              className="input"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6}
              required
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2 mt-4" role="alert">{error}</p>}

        <div className="flex gap-3 mt-6 justify-end">
          <button type="button" className="btn-secondary" onClick={close} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Update password
          </button>
        </div>
      </form>
    </div>
  )
}
