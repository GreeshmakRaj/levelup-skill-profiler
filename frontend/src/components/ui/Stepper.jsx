/**
 * Minimal, modern, responsive horizontal stepper.
 * `steps` is an array of labels; `current` is the active 0-based index.
 */
export default function Stepper({ steps, current }) {
  return (
    <ol className="grid w-full" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="relative min-w-0 px-1 text-center">
            {i < steps.length - 1 && (
              <div
                className={`absolute left-1/2 right-[-50%] top-4 h-px ${done ? 'bg-brand-400' : 'bg-line'}`}
                aria-hidden="true"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-2 min-w-0">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500'
                    : 'bg-surface text-faint'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`hidden w-full max-w-28 break-words text-center text-xs leading-snug sm:block ${
                  active ? 'font-medium text-ink' : 'text-faint'
                }`}
              >
                {label}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
