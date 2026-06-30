export default function SkillProfileCard({ profile }) {
  const isAligned = profile.roleAlignment === 'ALIGNED'

  const ratingColor = r => {
    if (r >= 8) return 'bg-green-100 text-green-800'
    if (r >= 5) return 'bg-blue-50 text-blue-800'
    return 'bg-amber-50 text-amber-800'
  }

  const sortedSkills = Object.entries(profile.skills)
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-6">
      {/* Role summary */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Role Analysis</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Provided Role</p>
            <p className="font-semibold text-sm">{profile.providedRole}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">AI Inferred Role</p>
            <p className="font-semibold text-sm">{profile.inferredRole}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Target Role</p>
            <p className="font-semibold text-sm text-brand-600">{profile.targetRole}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isAligned ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
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
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Skill Profile <span className="text-gray-300 font-normal">({sortedSkills.length} skills)</span>
        </h2>
        <div className="space-y-2.5">
          {sortedSkills.map(([skill, rating]) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="w-40 text-sm text-gray-700 shrink-0 truncate">{skill}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
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
      {profile.skillGaps?.length > 0 && (
        <div className="card border-red-100">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Skill Gaps to reach <span className="text-red-600">{profile.targetRole}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skillGaps.map(gap => (
              <span key={gap} className="gap-pill">
                <span className="text-red-400">↑</span> {gap}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            These skills are missing or below proficiency level 6 for your target role.
          </p>
        </div>
      )}

      {profile.skillGaps?.length === 0 && (
        <div className="card border-green-100 bg-green-50">
          <p className="text-sm font-semibold text-green-700">🎉 No skill gaps detected!</p>
          <p className="text-xs text-green-600 mt-1">Your current skills meet the requirements for {profile.targetRole}.</p>
        </div>
      )}

      <p className="text-xs text-gray-300 text-center">
        Last updated {new Date(profile.lastUpdated || profile.analyzedAt).toLocaleString()}
      </p>
    </div>
  )
}
