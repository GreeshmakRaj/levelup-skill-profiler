import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 shadow-lg">
      <p className="font-semibold">{item.label}</p>

      <p className="text-sm text-muted">
        {item.percentage}
      </p>
    </div>
  )
}

export default function SkillDonutChart({
  data,
  selectedGroup,
  onSelect
}) {

  return (

    <ResponsiveContainer
      width="100%"
      height={350}
    >

      <PieChart>

        <Pie
          data={data}
          innerRadius={70}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          nameKey="label"
          activeIndex={
            data.findIndex(
              g => g.label === selectedGroup?.label
            )
          }
          onClick={(_, index) => {
            onSelect(data[index])
          }}
        >

          {data.map(item => (
            <Cell
              key={item.label}
              fill={item.color}
            />
          ))}

        </Pie>

        <Tooltip content={<CustomTooltip />} />

        <Legend />

      </PieChart>

    </ResponsiveContainer>

  )
}