export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="card text-center py-12 px-6">
      {icon && (
        <div className="mx-auto w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-muted mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
