import StatusBadge from './StatusBadge'

export default function ProgressHeader({ roadmap }) {
  const { target_role, status, plan, created_at } = roadmap
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-ink">{target_role}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted">Created on {formatDate(created_at)}</p>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div>
            <p className="text-faint text-xs mb-1">Total Weeks</p>
            <p className="font-semibold text-ink">{plan.total_weeks}</p>
          </div>
          <div className="w-px h-8 bg-line" />
          <div>
            <p className="text-faint text-xs mb-1">Status</p>
            <p className="font-semibold text-ink capitalize">{status}</p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-line">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">Summary</h2>
        <p className="text-sm text-ink">{plan.summary}</p>
      </div>
    </div>
  )
}
