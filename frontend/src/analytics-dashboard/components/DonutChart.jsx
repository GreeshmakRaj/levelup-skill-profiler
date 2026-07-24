import { useState } from 'react'
import ChartTooltip from './ChartTooltip'

export default function DonutChart({ data, score }) {
  const [activeItem, setActiveItem] = useState(null)

  const total = data?.reduce((sum, item) => sum + item.value, 0) || 100

  const gradient = data
    ? `conic-gradient(${data
        .map((item, index) => {
          const previous = data
            .slice(0, index)
            .reduce((sum, entry) => sum + entry.value, 0)

          const start = (previous / total) * 100
          const end = ((previous + item.value) / total) * 100

          return `${item.color} ${start}% ${end}%`
        })
        .join(', ')})`
    : `conic-gradient(#0891b2 0% ${score}%, rgb(var(--border)) ${score}% 100%)`

  const tooltip = activeItem
    ? {
        x: 50,
        y: 8,
        title: activeItem.label || 'Overall score',
        value: data
          ? `${activeItem.value} skills`
          : `${score} out of 100`,
      }
    : null

  const handleMouseMove = (e) => {
    if (!data) return

    const rect = e.currentTarget.getBoundingClientRect()

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    // Distance from center
    const distance = Math.sqrt(x * x + y * y)

    // Ignore the inner hole
    const outerRadius = rect.width / 2
    const innerRadius = outerRadius - 32 // same as inset-8

    if (distance < innerRadius || distance > outerRadius) {
      setActiveItem(null)
      return
    }

    // Convert mouse position to angle
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90

    if (angle < 0) {
      angle += 360
    }

    let cumulative = 0

    for (const item of data) {
      cumulative += (item.value / total) * 360

      if (angle <= cumulative) {
        setActiveItem(item)
        return
      }
    }

    setActiveItem(null)
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-5">
      <ChartTooltip visible={!!tooltip} {...tooltip} />

      <button
        type="button"
        className="relative w-44 h-44 rounded-full transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ background: gradient }}
        aria-label={
          data
            ? `Total employees ${total}`
            : `Overall score ${score} out of 100`
        }
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveItem(null)}
      >
        <span className="absolute inset-8 rounded-full bg-card flex flex-col items-center justify-center pointer-events-none">
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
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}