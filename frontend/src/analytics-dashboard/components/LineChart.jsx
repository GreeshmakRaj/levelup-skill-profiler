import { useState } from 'react'
import ChartTooltip from './ChartTooltip'

export default function LineChart({ series, labels, target }) {
  const [activePoint, setActivePoint] = useState(null)
  const width = 720
  const height = 230
  const pad = 32
  const axisLabels = labels?.length ? labels : series.map((_, index) => String(index + 1))
  const points = series.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(series.length - 1, 1)
    const y = height - pad - (value / 100) * (height - pad * 2)
    return `${x},${y}`
  })
  const targetPoints = target?.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(target.length - 1, 1)
    const y = height - pad - (value / 100) * (height - pad * 2)
    return `${x},${y}`
  })
  const tooltip = activePoint
    ? {
        x: (activePoint.x / width) * 100,
        y: (activePoint.y / height) * 100,
        title: activePoint.label,
        value: `Score: ${activePoint.value}`,
      }
    : null

  return (
    <div className="relative">
      <ChartTooltip visible={!!tooltip} {...tooltip} />
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = height - pad - (tick / 100) * (height - pad * 2)
          return (
            <g key={tick}>
              <line x1={pad} x2={width - pad} y1={y} y2={y} stroke="currentColor" className="text-line" strokeDasharray="4 4" />
              <text x={8} y={y + 4} className="fill-muted text-[11px]">{tick}</text>
            </g>
          )
        })}
        {axisLabels.map((label, index) => {
          const x = pad + (index * (width - pad * 2)) / Math.max(axisLabels.length - 1, 1)
          return <text key={`${label}-${index}`} x={x - 9} y={height - 8} className="fill-muted text-[11px]">{label}</text>
        })}
        {targetPoints && (
          <polyline points={targetPoints.join(' ')} fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5 5" />
        )}
        <polyline points={points.join(' ')} fill="none" stroke="#0891b2" strokeWidth="3" />
        {points.map((point, index) => {
          const [x, y] = point.split(',').map(Number)
          const isActive = activePoint?.index === index
          return (
            <g
              key={point}
              tabIndex={0}
              role="img"
              aria-label={`${axisLabels[index]} score ${series[index]}`}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setActivePoint({ index, x, y, label: axisLabels[index], value: series[index] })}
              onMouseLeave={() => setActivePoint(null)}
              onFocus={() => setActivePoint({ index, x, y, label: axisLabels[index], value: series[index] })}
              onBlur={() => setActivePoint(null)}
            >
              <circle cx={x} cy={y} r="12" fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={isActive ? '6' : '4'}
                fill="rgb(var(--card))"
                stroke="#0891b2"
                strokeWidth={isActive ? '3' : '2'}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}