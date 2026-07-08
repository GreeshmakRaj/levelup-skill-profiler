'use client'
import { ROLE_LABELS } from '@global/constants/roles'

function Field({ label, value, accent = false }) {
  return (
    <div>
      <p className="text-xs text-faint mb-1">{label}</p>
      <p className={`font-semibold text-sm truncate ${accent ? 'text-brand-600' : 'text-ink'}`}>
        {value || '—'}
      </p>
    </div>
  )
}

export default function ProfileSummaryCard({ profile, latest }) {
  const fullName = profile?.username || profile?.email

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-5">
        <span className="w-14 h-14 rounded-2xl bg-brand-500 text-white text-xl font-semibold flex items-center justify-center shrink-0">
          {(fullName?.[0] || '?').toUpperCase()}
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-ink text-lg truncate">{fullName}</h2>
          <p className="text-sm text-faint truncate">{profile?.email}</p>
        </div>
        {profile?.role && (
          <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 shrink-0">
            {ROLE_LABELS[profile.role]}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-line">
        <Field label="Email" value={profile?.email} />
        <Field label="Manager" value={profile?.reportsToName} />
        <Field
          label="Last Analyzed"
          value={latest ? new Date(latest.createdAt).toLocaleDateString() : 'No assessment yet'}
        />
      </div>
    </div>
  )
}
