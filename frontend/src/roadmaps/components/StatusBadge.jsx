const STATUS_CONFIG = {
  active: {
    label: 'Active',
    className: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400 border-green-200 dark:border-green-500/30'
  },
  completed: {
    label: 'Completed',
    className: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 border-brand-200 dark:border-brand-500/30'
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
  },
  archived: {
    label: 'Archived',
    className: 'bg-faint text-muted border-line'
  }
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
