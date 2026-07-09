import { useEffect, useRef, useState } from 'react'
import { useToast } from '../ui/Toast'

export default function LearningPathCard({ item, onOpen, onDelete }) {
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  const copySkillId = async (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    try {
      await navigator.clipboard.writeText(item.skillId)
      toast.success('Skill ID copied')
    } catch {
      toast.error('Could not copy Skill ID')
    }
  }

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setMenuOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const gaps = item.skillGaps?.length ?? 0
  const skills = Object.keys(item.skills || {}).length
  const aligned = item.roleAlignment === 'ALIGNED'

  return (
    <div
      className="card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col"
      onClick={() => onOpen?.(item)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-faint">Target Role</p>
          <h3 className="font-semibold text-ink truncate">{item.targetRole}</h3>
        </div>

        <div className="relative shrink-0" ref={ref}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
            className="text-faint hover:text-ink p-1 rounded-lg hover:bg-surface"
            aria-label="More actions"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="19" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-card rounded-xl border border-line shadow-lift overflow-hidden z-20 animate-scaleIn origin-top-right">
              <button
                onClick={copySkillId}
                className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-surface border-b border-line"
              >
                Copy Skill ID
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete?.(item) }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted mt-1">From {item.currentRole}</p>

      <div className="flex items-center gap-2 mt-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
          aligned ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${aligned ? 'bg-green-500' : 'bg-amber-500'}`} />
          {aligned ? 'Aligned' : 'Misaligned'}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">{skills} skills</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400">{gaps} gaps</span>
      </div>

      <p className="text-xs text-faint mt-4 pt-3 border-t border-line">
        {new Date(item.createdAt).toLocaleString()}
      </p>
    </div>
  )
}
