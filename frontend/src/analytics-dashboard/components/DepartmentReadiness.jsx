import { useState } from 'react'
import ChartCard from './ChartCard'
import ChartTooltip from './ChartTooltip'

export default function DepartmentReadiness({ items }) {
  const [activeItem, setActiveItem] = useState(null)
  const tooltip = activeItem
    ? {
        x: 50,
        y: activeItem.y,
        title: activeItem.department,
        value: `Readiness: ${activeItem.value}%`,
      }
    : null

  return (
    <ChartCard title="Department readiness" subtitle="AI / digital skill maturity by department">
      <div className="relative space-y-4">
        <ChartTooltip visible={!!tooltip} {...tooltip} />
        {items.map((item, index) => (
          <div key={item.department}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-ink">{item.department}</span>
              <span className="text-xs font-semibold text-muted">{item.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-500/15">
              <button
                type="button"
                className="block h-full rounded-full bg-cyan-600 transition-opacity hover:opacity-85"
                style={{ width: `${item.value}%` }}
                aria-label={`${item.department} readiness ${item.value}%`}
                onMouseEnter={() => setActiveItem({ ...item, y: index * 28 + 8 })}
                onMouseLeave={() => setActiveItem(null)}
                onFocus={() => setActiveItem({ ...item, y: index * 28 + 8 })}
                onBlur={() => setActiveItem(null)}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}