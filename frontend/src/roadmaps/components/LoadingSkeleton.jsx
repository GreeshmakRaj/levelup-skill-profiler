export default function LoadingSkeleton() {
  return (
    <div className="card p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-surface rounded w-3/4" />
        <div className="h-3 bg-surface rounded w-1/2" />
        <div className="h-3 bg-surface rounded w-5/6" />
        <div className="h-3 bg-surface rounded w-2/3" />
      </div>
    </div>
  )
}

export function RoadmapCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-5 bg-surface rounded w-1/2" />
        <div className="h-3 bg-surface rounded w-1/3" />
        <div className="h-3 bg-surface rounded w-full" />
        <div className="h-3 bg-surface rounded w-2/3" />
        <div className="h-8 bg-surface rounded w-1/4 mt-4" />
      </div>
    </div>
  )
}
