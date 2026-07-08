'use client'
export default function Roadmap() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Roadmap</h1>
        <p className="text-muted text-sm mt-1">Skill growth roadmaps and career progression planning.</p>
      </div>
      <div className="card text-center py-14">
        <p className="font-medium text-ink">Module scaffold ready</p>
        <p className="text-sm text-muted mt-1">
          Build this feature in{' '}
          <span className="font-mono text-xs">src/features/roadmap/</span>.
        </p>
      </div>
    </div>
  )
}
