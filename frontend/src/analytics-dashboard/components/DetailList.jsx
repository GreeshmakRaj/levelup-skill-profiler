export default function DetailList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-line bg-surface px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{item.title}</p>
            </div>

            <span className="chip bg-brand-50 text-brand-700">
              {item.badge}
            </span>
          </div>

          {item.url && (
            <button
              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              View Course →
            </button>
          )}
        </div>
      ))}
    </div>
  )
}