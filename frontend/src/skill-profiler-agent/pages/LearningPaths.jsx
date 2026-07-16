import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listMySkills, analyzeSkills, deleteSkill, getSkill } from '../services/api'
import Stepper from '../components/ui/Stepper'
import RoleSelect from '../components/ui/RoleSelect'
import SelfAssessmentInput from '../components/skills/SelfAssessmentInput'
import SkillProfileCard from '../components/skills/SkillProfileCard'
import LearningPathCard from '../components/skills/LearningPathCard'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'

const STEPS = ['Upload Resume', 'Roles', 'Skill Assessment (optional)', 'Review']

const emptyForm = { currentRole: '', targetRole: '', selfAssessment: {}, resume: null }

export default function LearningPaths() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('list') // 'list' | 'analyze' | 'detail'
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Stepper state
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptyForm)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await listMySkills())
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  const openDetail = useCallback(async (skillId) => {
    setSelected(null)
    setLoadingDetail(true)
    setView('detail')
    try {
      setSelected(await getSkill(skillId))
    } catch (err) {
      toast.error(err.message)
      setView('list')
    } finally {
      setLoadingDetail(false)
    }
  }, [toast])

  // Deep-link: /learning-paths?analysis=<skillId> opens that record's detail.
  useEffect(() => {
    const id = searchParams.get('analysis')
    if (id) {
      openDetail(id)
      searchParams.delete('analysis')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, openDetail])

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function startNew() {
    setForm(emptyForm); setStep(0); setError(''); setSelected(null); setView('analyze')
  }

  const canNext = {
    0: !!form.resume,
    1: form.currentRole.trim() && form.targetRole.trim(),
    2: true, // self-assessment is optional
    3: true,
  }[step]

  async function handleAnalyze() {
    setError('')
    setAnalyzing(true)
    try {
      const result = await analyzeSkills({
        currentRole: form.currentRole,
        targetRole: form.targetRole,
        resume: form.resume,
        selfAssessment: form.selfAssessment,
      })
      const llmName = result.llmModel
        ? `${result.llmProvider || 'LLM'} (${result.llmModel})`
        : result.llmProvider || 'LLM'
      toast.success(`Skill gap analysis complete using ${llmName}.`)
      setSelected(result)
      setView('detail')
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteSkill(toDelete.skillId)
      toast.success('Assessment deleted.')
      if (selected?.skillId === toDelete.skillId) { setView('list'); setSelected(null) }
      setToDelete(null)
      load()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── Detail view ──────────────────────────────────────────────────────────
  if (view === 'detail') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Skill Gap Analysis</h1>
          <button className="btn-ghost text-sm" onClick={() => { setView('list'); setSelected(null) }}>← Back to Learning Paths</button>
        </div>
        {loadingDetail || !selected ? (
          <div className="space-y-4">
            <div className="skeleton h-32" />
            <div className="skeleton h-64" />
            <div className="skeleton h-24" />
          </div>
        ) : (
          <SkillProfileCard profile={selected} />
        )}
      </div>
    )
  }

  // ── Analyze (stepper) view ───────────────────────────────────────────────
  if (view === 'analyze') {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">New Skill Analysis</h1>
          <button className="btn-ghost text-sm" onClick={() => setView('list')}>Cancel</button>
        </div>

        <div className="card">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8">
            {/* Step 1 — Upload Resume */}
            {step === 0 && (
              <div>
                <h2 className="font-semibold text-ink mb-1">Upload your resume</h2>
                <p className="text-sm text-muted mb-5">PDF or DOCX</p>
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors ${
                  form.resume ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'border-line hover:border-brand-300'
                }`}>
                  <input type="file" accept=".pdf,.docx" className="hidden"
                    onChange={(e) => setField('resume', e.target.files[0] || null)} />
                  {form.resume ? (
                    <>
                      <svg className="w-8 h-8 text-brand-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-medium text-brand-700 dark:text-brand-400 text-sm">{form.resume.name}</p>
                      <p className="text-xs text-brand-500 mt-1">{(form.resume.size / 1024).toFixed(0)} KB — click to change</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-faint mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <p className="text-sm text-muted">Click to upload or drag and drop</p>
                      <p className="text-xs text-faint mt-1">PDF or DOCX</p>
                    </>
                  )}
                </label>
              </div>
            )}

            {/* Step 2 — Roles */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Current Role</label>
                  <RoleSelect value={form.currentRole} onChange={(v) => setField('currentRole', v)}
                    placeholder="Search your current role…" />
                </div>
                <div>
                  <label className="label">Target Role</label>
                  <RoleSelect value={form.targetRole} onChange={(v) => setField('targetRole', v)}
                    placeholder="Search your target role…" />
                </div>
              </div>
            )}

            {/* Step 3 — Skill Assessment */}
            {step === 2 && (
              <div>
                <h2 className="font-semibold text-ink mb-1">Rate your skills <span className="text-muted font-normal">(optional)</span></h2>
                <p className="text-sm text-muted mb-5">Merged with skills extracted from your resume. Skip this step to rely on the resume alone.</p>
                <SelfAssessmentInput value={form.selfAssessment} onChange={(v) => setField('selfAssessment', v)} />
              </div>
            )}

            {/* Step 4 — Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-semibold text-ink">Review &amp; analyze</h2>
                <dl className="space-y-3 text-sm bg-surface rounded-xl p-4">
                  <div className="flex justify-between"><dt className="text-muted">Resume</dt><dd className="text-ink font-medium">{form.resume?.name}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Current Role</dt><dd className="text-ink font-medium">{form.currentRole}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Target Role</dt><dd className="text-brand-600 dark:text-brand-400 font-medium">{form.targetRole}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted">Skills rated</dt><dd className="text-ink font-medium">{Object.keys(form.selfAssessment).length}</dd></div>
                </dl>
                {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2" role="alert">{error}</p>}
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button className="btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={analyzing}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="btn-primary ml-auto" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue →
              </button>
            ) : (
              <button className="btn-primary ml-auto flex items-center gap-2" disabled={analyzing} onClick={handleAnalyze}>
                {analyzing && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {analyzing ? 'Analyzing with AI…' : 'Analyze Skill Gap'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Learning Paths</h1>
          <p className="text-muted text-sm mt-1">Analyze your skill gaps and track your growth.</p>
        </div>
        <button className="btn-primary text-sm" onClick={startNew}>+ New Analysis</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-44" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-14">
          <p className="font-medium text-ink">No analyses yet</p>
          <p className="text-sm text-muted mt-1 mb-4">Upload your resume and analyze your first skill gap.</p>
          <button className="btn-primary text-sm" onClick={startNew}>Start analysis</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <LearningPathCard
              key={item.skillId}
              item={item}
              onOpen={(it) => openDetail(it.skillId)}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        destructive
        title="Delete assessment?"
        message="This permanently removes the assessment and its uploaded resume. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
