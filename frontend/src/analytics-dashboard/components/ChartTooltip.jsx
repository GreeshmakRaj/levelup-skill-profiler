export default function ChartTooltip({ visible, x = 50, y = 0, title, value, detail }) {
  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute z-10 min-w-[132px] rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
      role="status"
    >
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-0.5 text-muted">{value}</p>
      {detail && <p className="mt-1 text-faint">{detail}</p>}
    </div>
  )
}