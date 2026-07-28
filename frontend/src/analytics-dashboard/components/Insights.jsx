import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function InsightsPanel({ insights = [], open, onClose }) {
  if (!open || insights.length === 0) return null

  return (
    <div className="absolute right-0 top-12 z-50 w-[420px] rounded-xl border border-line bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="font-semibold text-ink flex items-center gap-2">
          <LightBulbIcon className="h-5 w-5 text-amber-500" />
          AI Insights
        </h3>

        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-elevated"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto p-4 space-y-3">
        {insights.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-line bg-elevated p-3 text-sm text-muted"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}