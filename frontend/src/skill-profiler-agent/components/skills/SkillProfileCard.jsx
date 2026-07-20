import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../ui/Toast'
import { generateRoadmap, getEmployeeRoadmaps } from '../../../roadmaps/services/roadmapService'

export default function SkillProfileCard({ profile }) {
  const isAligned = profile.roleAlignment === 'ALIGNED'
  const [generating, setGenerating] = useState(false)
  const [hasRoadmap, setHasRoadmap] = useState(false)
  const [checkingRoadmap, setCheckingRoadmap] = useState(true)
  const [availableWeeks, setAvailableWeeks] = useState('')
  const navigate = useNavigate()
  const auth = useAuth()
  const toast = useToast()

  // need to store the data in teh skill set profile.
  useEffect(() => {
    async function checkRoadmap() {
      if (!profile.skillId || !auth?.user?.id) {
        setCheckingRoadmap(false)
        return
      }
      try {
        const roadmaps = await getEmployeeRoadmaps(auth.user.id, profile.skillId)
        setHasRoadmap(roadmaps.length > 0)
      } catch {
        setHasRoadmap(false)
      } finally {
        setCheckingRoadmap(false)
      }
    }
    checkRoadmap()
  }, [profile.skillId, auth?.user?.id])

  const handleGenerateRoadmap = async () => {
    if (!profile.skillId) {
      toast.error('Skill ID not available')
      return
    }

    setGenerating(true)
    try {
      const roadmap = await generateRoadmap(profile.skillId, availableWeeks || undefined)
      toast.success('Roadmap generated successfully!')
      navigate(`/roadmaps-list?skillid=${roadmap.skill_id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  const handleViewRoadmap = () => {
    navigate(`/roadmaps-list?skillid=${profile.skillId}`)
  }

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
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-sm font-semibold text-faint uppercase tracking-wider">Role Analysis</h2>
          <div className="flex items-center gap-2">
          {!hasRoadmap && !checkingRoadmap && (
            <select
              value={availableWeeks}
              onChange={e => setAvailableWeeks(e.target.value)}
              disabled={generating}
              title="How many weeks are you available?"
              className="px-2 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-ink dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Full plan (up to 12 wks)</option>
              <option value="4">4 weeks</option>
              <option value="6">6 weeks</option>
              <option value="8">8 weeks</option>
              <option value="10">10 weeks</option>
            </select>
          )}
          <button
            onClick={hasRoadmap ? handleViewRoadmap : handleGenerateRoadmap}
            disabled={generating || checkingRoadmap}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checkingRoadmap ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : hasRoadmap ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Roadmap
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Generate Roadmap
              </>
            )}
          </button>
          </div>
        </div>
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
