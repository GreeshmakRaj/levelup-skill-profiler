import { useState } from 'react'

const PRESET_SKILLS = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Spring Boot', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
  'Machine Learning', 'AI', 'LLM', 'RAG', 'Data Science',
]

export default function SelfAssessmentInput({ value, onChange }) {
  const [newSkill, setNewSkill] = useState('')

  function addSkill(skill) {
    const trimmed = skill.trim()
    if (!trimmed || value[trimmed] !== undefined) return
    onChange({ ...value, [trimmed]: 5 })
    setNewSkill('')
  }

  function removeSkill(skill) {
    const updated = { ...value }
    delete updated[skill]
    onChange(updated)
  }

  function setRating(skill, rating) {
    onChange({ ...value, [skill]: Number(rating) })
  }

  const ratingLabel = r => ['', 'Aware', 'Beginner', 'Beginner+', 'Intermediate', 'Solid', 'Proficient', 'Advanced', 'Expert', 'Expert+', 'Master'][r] || r

  return (
    <div className="space-y-4">
      {/* Quick add presets */}
      <div>
        <p className="label">Quick add common skills</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SKILLS.filter(s => value[s] === undefined).map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="text-xs px-3 py-1 border border-gray-200 rounded-full hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Custom skill input */}
      <div className="flex gap-2">
        <input
          type="text"
          className="input"
          placeholder="Add a custom skill…"
          value={newSkill}
          onChange={e => setNewSkill(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
        />
        <button type="button" onClick={() => addSkill(newSkill)} className="btn-primary px-4 shrink-0">
          Add
        </button>
      </div>

      {/* Skill rating list */}
      {Object.keys(value).length > 0 && (
        <div className="space-y-3">
          {Object.entries(value).map(([skill, rating]) => (
            <div key={skill} className="flex items-center gap-3">
              <span className="w-36 text-sm font-medium text-gray-700 shrink-0 truncate">{skill}</span>
              <input
                type="range"
                min={1}
                max={10}
                value={rating}
                onChange={e => setRating(skill, e.target.value)}
                className="flex-1 accent-brand-500"
              />
              <span className="w-24 text-right text-xs text-brand-700 font-mono shrink-0">
                {rating} – {ratingLabel(rating)}
              </span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {Object.keys(value).length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">
          Add at least one skill above
        </p>
      )}
    </div>
  )
}
