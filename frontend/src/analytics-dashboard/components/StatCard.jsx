export default function StatCard({ label, value, delta, negative = false }) {
  return (
    <div className="card p-4 min-h-[96px] flex flex-col justify-between">
      <p className="text-sm text-muted">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-ink">{value}</p>
        {delta && (
          <span className={`text-xs font-semibold pb-1 ${negative ? 'text-red-500' : 'text-emerald-600'}`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  )
}