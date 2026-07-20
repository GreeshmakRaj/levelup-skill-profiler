import ChartCard from '../components/ChartCard'
import BarChart from '../components/BarChart'
import DonutChart from '../components/DonutChart'
import DetailList from '../components/DetailList'

export default function ManagerView({ data }) {
  const gapItems = data.skillGaps.map((item) => ({
    title: item.skill,
    badge: `${item.employeesAffected} affected`,
  }))
  const memberItems = data.teamMembers.map((member) => ({
    title: member.name,
    badge: `${member.skillScore} score`,
    description: `Learning progress ${member.learningProgress}%`,
  }))

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Team progress" subtitle={`Managed by ${data.profile.name}`}>
          <BarChart data={data.progress} />
        </ChartCard>
        <ChartCard title="Team skill distribution" subtitle="Employees by skill">
          <DonutChart data={data.distribution} />
        </ChartCard>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Open skill gaps" subtitle={`Training completion ${data.analytics.trainingCompletionRate}%`}>
          <DetailList items={gapItems} />
        </ChartCard>
        <ChartCard title="Team members" subtitle={`Top performer: ${data.analytics.topPerformer}`}>
          <DetailList items={memberItems} />
        </ChartCard>
      </div>
    </div>
  )
}