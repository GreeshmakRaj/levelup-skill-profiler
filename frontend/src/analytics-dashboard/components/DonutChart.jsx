import { useState } from 'react'
import ChartTooltip from './ChartTooltip'

export default function DonutChart({ data, score }) {
  const [activeItem, setActiveItem] = useState(null)
  const total = data?.reduce((sum, item) => sum + item.value, 0) || 100
  const gradient = data
    ? `conic-gradient(${data.map((item, index) => {
        const previous = data.slice(0, index).reduce((sum, entry) => sum + entry.value, 0)
        const start = (previous / total) * 100
        const end = ((previous + item.value) / total) * 100
        return `${item.color} ${start}% ${end}%`
      }).join(', ')})`
    : `conic-gradient(#0891b2 0% ${score}%, rgb(var(--border)) ${score}% 100%)`
  const tooltip = activeItem
    ? {
        x: 50,
        y: 8,
        title: activeItem.label || 'Overall score',
        value: activeItem.label ? `${activeItem.value} employees` : `${score} out of 100`,
      }
    : null

  return (
    <div className="relative flex flex-col items-center justify-center gap-5">
      <ChartTooltip visible={!!tooltip} {...tooltip} />
      <button
        type="button"
        className="relative w-44 h-44 rounded-full transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ background: gradient }}
        aria-label={data ? `Total employees ${total}` : `Overall score ${score} out of 100`}
        onMouseEnter={() => setActiveItem(data ? { label: 'Total', value: total } : { value: score })}
        onMouseLeave={() => setActiveItem(null)}
        onFocus={() => setActiveItem(data ? { label: 'Total', value: total } : { value: score })}
        onBlur={() => setActiveItem(null)}
      >
        <span className="absolute inset-8 rounded-full bg-card flex flex-col items-center justify-center">
          {score ? (
            <>
              <span className="text-3xl font-bold text-ink">{score}</span>
              <span className="text-xs text-muted">out of 100</span>
            </>
          ) : null}
        </span>
      </button>
      {data && (
        <div className="flex flex-wrap justify-center gap-3">
          {data.map((item) => (
            <button
              key={item.label}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
              onMouseEnter={() => setActiveItem(item)}
              onMouseLeave={() => setActiveItem(null)}
              onFocus={() => setActiveItem(item)}
              onBlur={() => setActiveItem(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}