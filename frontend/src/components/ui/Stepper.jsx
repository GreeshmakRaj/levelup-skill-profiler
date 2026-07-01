/**
 * Minimal, modern, responsive horizontal stepper.
 * `steps` is an array of labels; `current` is the active 0-based index.
 */
export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center w-full">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                    : 'bg-surface text-faint'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={`hidden sm:block text-sm ${active ? 'font-medium text-ink' : 'text-faint'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 sm:mx-4 ${done ? 'bg-brand-400' : 'bg-line'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
