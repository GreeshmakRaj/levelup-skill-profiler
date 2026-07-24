import { useState } from 'react'
import ChartTooltip from './ChartTooltip'

export default function BarChart({ data = [] }) {
  const [activeBar, setActiveBar] = useState(null)

  const maxValue = Math.max(100, ...data.map((d) => d.value))

  const yTicks = [100, 80, 60, 40, 20, 0]

  const getGridColumns = () => {
    if (data.length <= 3) return 'grid-cols-3'
    if (data.length === 4) return 'grid-cols-4'
    if (data.length === 5) return 'grid-cols-5'
    return 'grid-cols-6'
  }

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

      <div className="flex">
        {/* Y Axis */}
        <div className="w-12 h-64 flex flex-col justify-between">
          {yTicks.map((tick) => (
            <div
              key={tick}
              className="h-0 flex items-center justify-end pr-2"
            >
              <span className="text-xs text-muted leading-none">
                {tick}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1">
          {/* Plot Area */}
          <div className="relative h-64">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {yTicks.map((tick) => (
                <div
                  key={tick}
                  className="border-t border-line w-full"
                />
              ))}
            </div>

            {/* Bars */}
            <div
              className={`absolute inset-0 grid ${getGridColumns()} gap-4 px-4`}
            >
              {data.map((item, index) => {
                const x = ((index + 0.5) / data.length) * 100
                const isActive = activeBar?.name === item.name

                return (
                  <div
                    key={item.name}
                    className="flex items-end justify-center h-full"
                  >
                    <button
                      type="button"
                      className={`w-full max-w-[72px] rounded-t-lg bg-cyan-600 transition-all ${
                        isActive
                          ? 'opacity-100 ring-2 ring-cyan-300 ring-offset-2 ring-offset-card'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        height: `${(item.value / maxValue) * 100}%`,
                      }}
                      aria-label={`${item.name}: ${item.value}`}
                      onMouseEnter={() =>
                        setActiveBar({
                          ...item,
                          x,
                        })
                      }
                      onMouseLeave={() => setActiveBar(null)}
                      onFocus={() =>
                        setActiveBar({
                          ...item,
                          x,
                        })
                      }
                      onBlur={() => setActiveBar(null)}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* X Axis */}
          <div
            className={`grid ${getGridColumns()} gap-4 px-4 mt-3`}
          >
            {data.map((item) => (
              <div
                key={item.name}
                className="min-h-[48px] flex justify-center items-start"
              >
                <span
                  className="text-xs text-center leading-4 break-words"
                  title={item.name}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}