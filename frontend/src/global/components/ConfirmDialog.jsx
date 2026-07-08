'use client'
import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !loading && onCancel?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => !loading && onCancel?.()} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-card rounded-2xl shadow-lift border border-line w-full max-w-sm p-6 animate-scaleIn"
      >
        <h3 className="font-semibold text-ink text-lg">{title}</h3>
        {message && <p className="text-sm text-muted mt-2">{message}</p>}
        <div className="flex gap-3 mt-6 justify-end">
          <button className="btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`font-semibold px-5 py-2 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 ${
              destructive
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-brand-500 hover:bg-brand-600 text-white'
            }`}
          >
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
