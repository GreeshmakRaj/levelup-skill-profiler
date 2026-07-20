import ChartCard from '../components/ChartCard'
import LineChart from '../components/LineChart'
import DonutChart from '../components/DonutChart'
import DepartmentReadiness from '../components/DepartmentReadiness'
import DetailList from '../components/DetailList'

export default function ExecutiveView({ data }) {
  const departmentItems = data.departmentAnalytics.map((item) => ({
    title: item.department,
    badge: `${item.employees} employees`,
    description: `Average skill score ${item.avgSkillScore}, completion ${item.completion}%`,
  }))

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <ChartCard title="Monthly AI readiness" subtitle={`${data.profile.departments} departments`}>
          <LineChart series={data.completion} labels={data.trendLabels} />
        </ChartCard>
        <ChartCard title="Overall AI readiness" subtitle="Composite readiness">
          <DonutChart score={data.score} />
        </ChartCard>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <DepartmentReadiness items={data.readiness} />
        <ChartCard title="Department analytics" subtitle={`Highest: ${data.analytics.highestPerformingDepartment}`}>
          <DetailList items={departmentItems} />
        </ChartCard>
      </div>
    </div>
  )
}