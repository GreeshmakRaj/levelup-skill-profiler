export default function InsightsPanel({ insights = [], open, onClose }) {
  if (!open || insights.length === 0) return null

  return (
    <div className="absolute right-0 top-12 z-50 w-[420px] rounded-xl border border-line bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          {/* Bulb Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 text-amber-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12c.6.6 1 1.3 1.3 2h5.4c.3-.7.7-1.4 1.3-2A7 7 0 0012 2z"
            />
          </svg>

          AI Insights
        </h3>

        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-elevated"
        >
          {/* Close Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 6l12 12M18 6L6 18"
            />
          </svg>
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