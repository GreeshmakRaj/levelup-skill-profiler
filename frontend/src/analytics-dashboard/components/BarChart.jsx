import { useState } from 'react'
import ChartTooltip from './ChartTooltip'

export default function BarChart({ data }) {
  const [activeBar, setActiveBar] = useState(null)
  const columnCountClass = data.length <= 3 ? 'grid-cols-3' : data.length <= 4 ? 'grid-cols-4' : 'grid-cols-6'
  const tooltip = activeBar
    ? {
        x: activeBar.x,
        y: 18,
        title: activeBar.name,
        value: `Value: ${activeBar.value}`,
      }
    : null

  return (
    <div className="relative">
      <ChartTooltip visible={!!tooltip} {...tooltip} />
      <div className={`h-64 grid ${columnCountClass} gap-4 items-end px-4 border-b border-line`}>
        {data.map((item, index) => {
          const x = ((index + 0.5) / data.length) * 100
          const isActive = activeBar?.name === item.name
          return (
            <div key={item.name} className="flex flex-col items-center gap-2 h-full justify-end">
              <button
                type="button"
                className={`w-full max-w-[72px] rounded-t-lg bg-cyan-600 transition-all ${
                  isActive ? 'opacity-100 ring-2 ring-cyan-300 ring-offset-2 ring-offset-card' : 'opacity-85 hover:opacity-100'
                }`}
                style={{ height: `${Math.min(item.value, 100)}%` }}
                aria-label={`${item.name}: ${item.value}`}
                onMouseEnter={() => setActiveBar({ ...item, x })}
                onMouseLeave={() => setActiveBar(null)}
                onFocus={() => setActiveBar({ ...item, x })}
                onBlur={() => setActiveBar(null)}
              />
              <span className="text-xs text-muted text-center">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}