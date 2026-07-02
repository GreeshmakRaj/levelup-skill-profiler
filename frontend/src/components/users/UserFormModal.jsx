import { useState } from 'react'
import { ROLES, ROLE_LABELS } from '../../constants/roles'
import { createUser } from '../../services/api'
import { useToast } from '../ui/Toast'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_PASSWORD = '123456'
const emptyForm = { username: '', email: '', password: '', confirm: '', reportsTo: '' }

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default function UserFormModal({ open, creatorRole, managers = [], onClose, onCreated }) {
  const toast = useToast()
  const allowedRoles =
    creatorRole === ROLES.ADMIN ? [ROLES.MANAGER, ROLES.EMPLOYEE] : [ROLES.EMPLOYEE]

  const [form, setForm] = useState({ ...emptyForm, role: allowedRoles[0] })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  // Reporting-manager picker only when an Admin creates an Employee.
  const showManagerPicker = creatorRole === ROLES.ADMIN && form.role === ROLES.EMPLOYEE

  const reset = () => {
    setForm({ ...emptyForm, role: allowedRoles[0] })
    setShowPassword(false); setShowConfirm(false); setError('')
  }

  const close = () => { reset(); onClose() }

  function validate() {
    if (!form.username.trim()) return 'Username is required.'
    if (!EMAIL_RE.test(form.email.trim())) return 'Enter a valid email address.'
    // Password is optional — only validate when something was typed.
    if (form.password) {
      if (form.password.trim().length === 0) return 'Password cannot be only spaces.'
      if (form.password.length < 6) return 'Password must be at least 6 characters.'
      if (form.password !== form.confirm) return 'Passwords do not match.'
    }
    return ''
  }

  async function submit(e) {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    setError('')
    setLoading(true)
    try {
      await createUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password ? form.password : null,
        role: form.role,
        reportsTo: showManagerPicker && form.reportsTo ? form.reportsTo : null,
      })
      toast.success(`${ROLE_LABELS[form.role]} created successfully.`)
      onCreated?.()
      close()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => !loading && close()} />
      <div className="relative bg-card rounded-2xl shadow-lift border border-line w-full max-w-md p-6 animate-scaleIn">
        <form onSubmit={submit} noValidate>
          <h3 className="font-semibold text-ink text-lg mb-4">Create User</h3>
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={set('username')} maxLength={120} placeholder="e.g. Jane Doe" required />
          </div>
          <div className="mt-3">
            <label className="label">Email</label>
            <input type="email" autoComplete="off" className="input" value={form.email} onChange={set('email')} maxLength={254} required />
          </div>
          <div className="mt-3">
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={set('role')}>
              {allowedRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          <div className="mt-3">
            <label htmlFor="new-user-password" className="label">Password</label>
            <div className="relative">
              <input
                id="new-user-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="input pr-11"
                placeholder="Leave blank for default"
                value={form.password}
                onChange={set('password')}
                maxLength={128}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-ink"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            <p className="helper">Optional — defaults to <span className="font-mono">{DEFAULT_PASSWORD}</span> if left blank.</p>
          </div>
          {form.password && (
            <div className="mt-3">
              <label htmlFor="new-user-confirm" className="label">Confirm password</label>
              <div className="relative">
                <input
                  id="new-user-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-11"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  maxLength={128}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-ink"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
          )}

          {showManagerPicker && (
            <div className="mt-3">
              <label className="label">Reporting Manager</label>
              <select className="input" value={form.reportsTo} onChange={set('reportsTo')}>
                <option value="">Reports to Admin (default)</option>
                {managers.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2 mt-4" role="alert">{error}</p>}

          <div className="flex gap-3 mt-6 justify-end">
            <button type="button" className="btn-secondary" onClick={close} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Create user
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
