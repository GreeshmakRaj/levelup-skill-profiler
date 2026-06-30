import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { analyzeSkills, getEmployeeSkills } from '../services/api'
import SelfAssessmentInput from '../components/SelfAssessmentInput'
import SkillProfileCard from '../components/SkillProfileCard'

const STEPS = ['Role Info', 'Self Assessment', 'Upload Resume', 'Results']

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  // Form state
  const [employeeId, setEmployeeId] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [selfAssessment, setSelfAssessment] = useState({})
  const [resumeFile, setResumeFile] = useState(null)

  async function handleLoadExisting() {
    if (!employeeId.trim()) return
    setLoading(true)
    setError('')
    try {
      const existing = await getEmployeeSkills(employeeId)
      setProfile(existing)
      setStep(3)
    } catch {
      setError('No existing profile found. Fill in your roles and continue to create one.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAnalyze() {
    setError('')
    if (!resumeFile) { setError('Please upload your resume.'); return }
    if (Object.keys(selfAssessment).length === 0) { setError('Add at least one skill in self assessment.'); return }

    setAnalyzing(true)
    try {
      const result = await analyzeSkills({
        employeeId,
        currentRole,
        targetRole,
        resume: resumeFile,
        selfAssessment,
      })
      setProfile(result)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.872 1.884l-.1.666A1 1 0 0115 19h-6a1 1 0 01-.995-1.083l-.1-.666a3 3 0 00-.872-1.884l-.347-.347z" />
              </svg>
            </div>
            <span className="font-semibold text-ink">Skill Profiler</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button onClick={signOut} className="btn-ghost text-sm">Sign out</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">Your Skill Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload your resume and self-assess your skills — we'll identify your gaps and career alignment.
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center gap-2 mb-8">
            {STEPS.slice(0, 3).map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  i < step ? 'bg-brand-500 text-white' :
                  i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i === step ? 'font-medium text-ink' : 'text-gray-400'}`}>{label}</span>
                {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 0: Role info ── */}
        {step === 0 && (
          <div className="card max-w-lg">
            <h2 className="font-semibold text-ink mb-4">Tell us about your role</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Employee ID</label>
                <input
                  className="input"
                  placeholder="e.g. EMP001"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-gray-400 mt-1">Your organization employee ID</p>
              </div>
              <div>
                <label className="label">Your current role</label>
                <input
                  className="input"
                  placeholder="e.g. Senior Java Developer"
                  value={currentRole}
                  onChange={e => setCurrentRole(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Your target role</label>
                <input
                  className="input"
                  placeholder="e.g. AI Solution Architect"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 mt-4">{error}</p>}

            <div className="flex gap-3 mt-6">
              {/* Load existing profile button */}
              <button
                className="btn-ghost border border-gray-200 flex items-center gap-2"
                disabled={!employeeId.trim() || loading}
                onClick={handleLoadExisting}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : '↓'}
                Load existing
              </button>

              {/* New analysis button */}
              <button
                className="btn-primary"
                disabled={!currentRole.trim() || !targetRole.trim() || !employeeId.trim()}
                onClick={() => { setError(''); setStep(1) }}
              >
                Analyze new →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Self assessment ── */}
        {step === 1 && (
          <div className="card">
            <h2 className="font-semibold text-ink mb-1">Rate your skills</h2>
            <p className="text-sm text-gray-500 mb-5">
              Be honest — this is merged with what we extract from your resume.
            </p>
            <SelfAssessmentInput value={selfAssessment} onChange={setSelfAssessment} />
            <div className="flex gap-3 mt-6">
              <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
              <button
                className="btn-primary"
                disabled={Object.keys(selfAssessment).length === 0}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Resume upload ── */}
        {step === 2 && (
          <div className="card max-w-lg">
            <h2 className="font-semibold text-ink mb-1">Upload your resume</h2>
            <p className="text-sm text-gray-500 mb-5">PDF or DOCX, max 10 MB</p>

            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${
              resumeFile ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
            }`}>
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={e => setResumeFile(e.target.files[0] || null)}
              />
              {resumeFile ? (
                <>
                  <svg className="w-8 h-8 text-brand-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-brand-700 text-sm">{resumeFile.name}</p>
                  <p className="text-xs text-brand-500 mt-1">{(resumeFile.size / 1024).toFixed(0)} KB — click to change</p>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF or DOCX</p>
                </>
              )}
            </label>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button
                className="btn-primary flex items-center gap-2"
                disabled={!resumeFile || analyzing}
                onClick={handleAnalyze}
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing with AI…
                  </>
                ) : 'Analyze my skills →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ── */}
        {step === 3 && profile && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-ink">Skill Profile</h2>
                <p className="text-xs text-gray-400 mt-0.5">Employee ID: {profile.employeeId}</p>
              </div>
              <button
                className="btn-ghost text-sm"
                onClick={() => { setStep(0); setProfile(null); setResumeFile(null); setError('') }}
              >
                ← New analysis
              </button>
            </div>
            <SkillProfileCard profile={profile} />
          </div>
        )}
      </main>
    </div>
  )
}