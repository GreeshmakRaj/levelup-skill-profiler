export default function DetailList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-xl border border-line bg-surface px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-ink">{item.title}</p>
            {item.badge && <span className="chip bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">{item.badge}</span>}
          </div>
          {item.description && <p className="mt-1 text-xs text-muted">{item.description}</p>}
        </div>
      ))}
    </div>
  )
}