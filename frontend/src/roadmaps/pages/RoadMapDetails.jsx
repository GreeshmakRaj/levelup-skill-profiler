import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import { getRoadmap } from '../services/roadmapService'
import ProgressHeader from '../components/ProgressHeader'
import WeekTimeline from '../components/WeekTimeline'
import WeekCard from '../components/WeekCard'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'

export default function RoadMapDetails() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const skillId = searchParams.get('skillid')
  const auth = useAuth()
  const user = auth?.user ?? null
  
  const [roadmap, setRoadmap] = useState(null)
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const toggleWeek = (weekNumber) => {
    const newExpanded = new Set(expandedWeeks)
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber)
    } else {
      newExpanded.add(weekNumber)
    }
    setExpandedWeeks(newExpanded)
  }
  
  useEffect(() => {
    async function fetchRoadmap() {
      if (!skillId || !user?.id) {
        navigate('/roadmaps-list')
        return
      }
      
      try {
        setLoading(true)
        const data = await getRoadmap(user.id, skillId)
        setRoadmap(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoadmap()
  }, [skillId, user?.id, navigate])
  
  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-surface rounded w-1/3 mb-2" />
                <div className="h-3 bg-surface rounded w-full" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-2">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Error loading roadmap"
          description={error}
        />
      </div>
    )
  }
  
  if (!roadmap) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Roadmap not found"
          description="The roadmap you're looking for doesn't exist or you don't have access to it."
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Roadmap Details</h1>
        <button
          onClick={() => navigate('/roadmaps-list')}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Roadmap List
        </button>
      </div>
      
      <ProgressHeader roadmap={roadmap} />
      
      {/* Accordion-style Weeks Display */}
      <div className="space-y-3 sticky top-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Weekly Plan</h3>
        <div className="max-h-[600px] overflow-y-auto pr-2">
          {roadmap.plan.weeks.map((week, index) => (
            <div key={week.week} className={`border-2 border-line rounded-lg bg-white dark:bg-surface ${index > 0 ? 'mt-2' : ''}`}>
              <button
                onClick={() => toggleWeek(week.week)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-surface transition-colors rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-ink">Week {week.week}: {week.focus}</h4>
                </div>
                <svg
                  className={`w-5 h-5 text-muted transition-transform shrink-0 ${
                    expandedWeeks.has(week.week) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedWeeks.has(week.week) && (
                <div className="p-4 pt-0 border-t-2 border-line">
                  <WeekCard week={week} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}