import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../skill-profiler-agent/hooks/useAuth'
import { getEmployeeRoadmaps } from '../services/roadmapService'
import RoadmapCard from '../components/RoadmapCard'
import EmptyState from '../components/EmptyState'
import { RoadmapCardSkeleton } from '../components/LoadingSkeleton'
import RoadMapDetails from './RoadMapDetails'

export default function RoadMapList() {
  const [searchParams] = useSearchParams()
  const skillId = searchParams.get('skillid')
  const auth = useAuth()
  const user = auth?.user ?? null
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchRoadmaps() {
      if (!user?.id) return
      try {
        setLoading(true)
        const data = await getEmployeeRoadmaps(user.id)
        setRoadmaps(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoadmaps()
  }, [user?.id])
  
  // If skillId is present, show the details view inline
  if (skillId) {
    return <RoadMapDetails />
  }
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Roadmaps</h1>
          <p className="text-muted text-sm mt-1">Your learning roadmaps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <RoadmapCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Roadmaps</h1>
          <p className="text-muted text-sm mt-1">Your learning roadmaps</p>
        </div>
        <EmptyState
          title="Error loading roadmaps"
          description={error}
        />
      </div>
    )
  }
  
  if (roadmaps.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Roadmaps</h1>
          <p className="text-muted text-sm mt-1">Your learning roadmaps</p>
        </div>
        <EmptyState
          title="No roadmaps yet"
          description="You haven't generated any learning roadmaps. Start by analyzing your skill gaps."
        />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Roadmaps</h1>
        <p className="text-muted text-sm mt-1">Your learning roadmaps</p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((roadmap) => (
          <RoadmapCard key={roadmap.roadmap_id} roadmap={roadmap} />
        ))}
      </div>
    </div>
  )
}