import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_LABELS } from '../../constants/roles'
import { updateUsername } from '../../services/api'
import { useToast } from '../ui/Toast'
import ResetPasswordModal from './ResetPasswordModal'

function initials(profile, email) {
  const name = (profile?.username || '').trim()
  if (name) {
    const parts = name.split(/\s+/)
    const ini = (parts[0][0] + (parts[1]?.[0] || '')).trim()
    return ini.toUpperCase()
  }
  return (email?.[0] || '?').toUpperCase()
}

export default function ProfileMenu() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)

  async function saveUsername() {
    setSaving(true)
    try {
      await updateUsername(name.trim())
      await refreshProfile()
      toast.success('Username updated.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fullName = profile?.username || user?.email

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:bg-surface pl-1 pr-2 py-1 transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center">
          {initials(profile, user?.email)}
        </span>
        <span className="hidden sm:block text-sm text-muted max-w-[12rem] truncate">{user?.email}</span>
        <svg className="w-4 h-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-line shadow-lift overflow-hidden z-30 animate-scaleIn origin-top-right" role="menu">
          <div className="px-4 py-3 border-b border-line">
            <p className="text-sm font-semibold text-ink truncate">{fullName}</p>
            <p className="text-xs text-faint">{profile ? ROLE_LABELS[profile.role] : ''}</p>
          </div>
          <button
            onClick={() => { setName(profile?.username || ''); setShowProfile(true); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface flex items-center gap-2"
            role="menuitem"
          >
            <span>👤</span> Profile
          </button>
          <button
            onClick={() => { setShowReset(true); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface flex items-center gap-2"
            role="menuitem"
          >
            <span>🔑</span> Reset Password
          </button>
          <button
            onClick={signOut}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 border-t border-line"
            role="menuitem"
          >
            <span>↩</span> Logout
          </button>
        </div>
      )}

      <ResetPasswordModal open={showReset} onClose={() => setShowReset(false)} />

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative bg-card rounded-2xl shadow-lift border border-line w-full max-w-sm p-6 animate-scaleIn">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-12 rounded-full bg-brand-500 text-white text-lg font-semibold flex items-center justify-center">
                {initials(profile, user?.email)}
              </span>
              <div>
                <p className="font-semibold text-ink">{fullName}</p>
                <p className="text-xs text-faint">{profile ? ROLE_LABELS[profile.role] : ''}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="label">Username</label>
              <div className="flex gap-2">
                <input
                  className="input"
                  value={name}
                  maxLength={120}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your username"
                />
                <button
                  className="btn-primary shrink-0"
                  disabled={saving || !name.trim() || name.trim() === (profile?.username || '')}
                  onClick={saveUsername}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Email</dt>
                <dd className="text-ink font-medium">{user?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Role</dt>
                <dd className="text-ink font-medium">{profile ? ROLE_LABELS[profile.role] : '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Reports to</dt>
                <dd className="text-ink font-medium">{profile?.reportsToName || '—'}</dd>
              </div>
            </dl>
            <button className="btn-secondary w-full mt-6" onClick={() => setShowProfile(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
