import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ThemeToggle from '../components/ui/ThemeToggle'
import {
  APP_NAME, APP_TAGLINE, APP_VERSION, COMPANY_NAME, LEGAL_LINKS, PRODUCT_HIGHLIGHTS,
} from '../constants/app'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REMEMBER_KEY = 'skill-profiler-remember-email'

// Map raw auth errors to friendly, non-revealing messages.
function friendlyError(err) {
  const msg = (err?.message || '').toLowerCase()
  if (msg.includes('invalid login') || msg.includes('credential')) return 'The email or password you entered is incorrect.'
  if (msg.includes('email not confirmed')) return 'Please confirm your email before signing in.'
  if (msg.includes('rate') || msg.includes('too many')) return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('disabled') || msg.includes('banned')) return 'This account has been disabled. Contact your administrator.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return 'We couldn’t reach the server. Check your connection and try again.'
  return 'Something went wrong. Please try again.'
}

function Logo({ className = 'w-6 h-6 text-white' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.872 1.884l-.1.666A1 1 0 0115 19h-6a1 1 0 01-.995-1.083l-.1-.666a3 3 0 00-.872-1.884l-.347-.347z" />
    </svg>
  )
}

export default function AuthPage() {
  const auth = useAuth()
  const signIn = auth?.signIn ?? (() => ({ error: new Error('Auth not available') }))
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(() => !!localStorage.getItem(REMEMBER_KEY))
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { emailRef.current?.focus() }, [])

  const errors = {
    email: !email.trim()
      ? 'Email is required.'
      : email.length > 254
      ? 'Email is too long.'
      : !EMAIL_RE.test(email.trim())
      ? 'Enter a valid email address.'
      : '',
    password: !password
      ? 'Password is required.'
      : password.trim().length === 0
      ? 'Password cannot be only spaces.'
      : password.length < 6
      ? 'Password must be at least 6 characters.'
      : password.length > 128
      ? 'Password is too long.'
      : '',
  }
  const isValid = !errors.email && !errors.password

  function focusFirstInvalid() {
    if (errors.email) emailRef.current?.focus()
    else if (errors.password) passwordRef.current?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setTouched({ email: true, password: true })
    if (!isValid) return focusFirstInvalid()

    setLoading(true)
    try {
      const { error } = await signIn(email.trim(), password)
      if (error) throw error
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim())
      else localStorage.removeItem(REMEMBER_KEY)
      navigate('/dashboard')
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  const fieldInvalid = (k) => touched[k] && errors[k]

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* ── Left brand panel (desktop) ── */}
      <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/10 blur-3xl" aria-hidden />

        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur">
            <Logo />
          </div>
          <span className="font-semibold text-lg">{APP_NAME}</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">{APP_TAGLINE}</h2>
          <ul className="mt-8 space-y-5">
            {PRODUCT_HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="mt-0.5 shrink-0 w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-white/70">{h.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Protected by enterprise-grade authentication
        </p>
      </aside>

      {/* ── Right form panel ── */}
      <main className="relative flex flex-col">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-sm">
            {/* Mobile brand */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Logo />
              </div>
              <span className="font-semibold text-lg text-ink">{APP_NAME}</span>
            </div>

            <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
            <p className="text-sm text-muted mt-1.5">
              Sign in with the credentials provided by your administrator.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  className={`input ${fieldInvalid('email') ? 'input-error' : ''}`}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!fieldInvalid('email')}
                  aria-describedby={fieldInvalid('email') ? 'email-error' : undefined}
                  required
                />
                {fieldInvalid('email') && (
                  <p id="email-error" className="field-error" role="alert">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                    <input
                      id="password"
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      maxLength={128}
                      className={`input pr-11 ${fieldInvalid('password') ? 'input-error' : ''}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      aria-invalid={!!fieldInvalid('password')}
                      aria-describedby={fieldInvalid('password') ? 'password-error' : undefined}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-muted hover:text-ink"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {fieldInvalid('password') && (
                    <p id="password-error" className="field-error" role="alert">{errors.password}</p>
                  )}
                </div>

              {/* Remember me */}
              <label className="flex items-center gap-2 text-sm text-muted select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-line text-brand-500 focus:ring-brand-500"
                />
                Remember my email on this device
              </label>

              {/* Alerts */}
              {formError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5 flex items-center gap-2" role="alert">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formError}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Please wait…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-5 border-t border-line">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-faint">
            <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {LEGAL_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="hover:text-ink transition-colors">{l.label}</a>
              ))}
              <span className="text-faint/70">{APP_VERSION}</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
