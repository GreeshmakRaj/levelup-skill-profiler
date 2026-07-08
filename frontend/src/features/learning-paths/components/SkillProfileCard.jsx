'use client'
export default function SkillProfileCard({ profile }) {
  const isAligned = profile.roleAlignment === 'ALIGNED'

  const skillGaps = profile.skillGaps || []
  const hasGaps = skillGaps.length > 0

  const ratingColor = r => {
    if (r >= 8) return 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
    if (r >= 5) return 'bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
    return 'bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
  }

  const sortedSkills = Object.entries(profile.skills)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-6">
      {/* Role summary */}
      <div className="card">
        <h2 className="text-sm font-semibold text-faint uppercase tracking-wider mb-4">Role Analysis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-faint mb-1">Current Role</p>
            <p className="font-semibold text-sm text-ink">{profile.currentRole}</p>
          </div>
          <div>
            <p className="text-xs text-faint mb-1">Target Role</p>
            <p className="font-semibold text-sm text-brand-600 dark:text-brand-400">{profile.targetRole}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-line">
          <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isAligned ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAligned ? 'bg-green-500' : 'bg-amber-500'}`} />
            Role {isAligned ? 'Aligned' : 'Misaligned'} — {isAligned
              ? 'Your declared role matches your skill profile.'
              : 'Your skills suggest a different role than declared.'}
          </span>
        </div>
      </div>

      {/* Skill map */}
      <div className="card">
        <h2 className="text-sm font-semibold text-faint uppercase tracking-wider mb-1">
          Skill Profile <span className="text-faint/70 font-normal">({sortedSkills.length} skills)</span>
        </h2>
        <p className="text-xs text-muted mb-4">
          Calculated from your resume skills merged with your self-assessment ratings.
        </p>
        <div className="space-y-2.5">
          {sortedSkills.map(([skill, rating]) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="w-32 sm:w-40 text-sm text-ink shrink-0 truncate">{skill}</span>
              <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${rating * 10}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 ${ratingColor(rating)}`}>
                {rating}/10
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Skill gaps */}
      {hasGaps && (
        <div className="card border-red-200 dark:border-red-500/30">
          <h2 className="text-sm font-semibold text-faint uppercase tracking-wider mb-4">
            Skill Gaps to reach <span className="text-red-600 dark:text-red-400">{profile.targetRole}</span>
          </h2>
          <div className="space-y-2.5">
            {skillGaps.map(({ skill, requiredLevel }) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="w-32 sm:w-40 text-sm text-ink shrink-0 truncate">{skill}</span>
                <div className="flex-1 bg-surface rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-red-500 transition-all"
                    style={{ width: `${(requiredLevel || 0) * 10}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md shrink-0 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  {requiredLevel || 0}/10
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">
            Target proficiency required for {profile.targetRole}. These skills are missing or below level 6 in your profile.
          </p>
        </div>
      )}

      {!hasGaps && (
        <div className="card border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10">
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">🎉 No skill gaps detected!</p>
          <p className="text-xs text-green-600 dark:text-green-400/80 mt-1">Your current skills meet the requirements for {profile.targetRole}.</p>
        </div>
      )}

      <p className="text-xs text-faint text-center">
        Last updated {new Date(profile.createdAt || profile.analyzedAt).toLocaleString()}
      </p>
    </div>
  )
}
