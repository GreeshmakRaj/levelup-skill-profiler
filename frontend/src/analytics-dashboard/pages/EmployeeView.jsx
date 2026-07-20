import ChartCard from '../components/ChartCard'
import LineChart from '../components/LineChart'
import BarChart from '../components/BarChart'
import DetailList from '../components/DetailList'

export default function EmployeeView({ data }) {
  const recommendationItems = data.recommendations.map((item) => ({
    title: item.course,
    badge: item.priority,
    description: item.reason,
  }))

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Skill score trend" subtitle={`${data.profile.name} | ${data.profile.designation}`}>
          <LineChart series={data.trend} labels={data.trendLabels} />
        </ChartCard>
        <ChartCard title="Skill distribution" subtitle="Current skill scores">
          <BarChart data={data.skillDistribution} />
        </ChartCard>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {data.roadmap && (
          <ChartCard title="Roadmap progress" subtitle={`Week ${data.roadmap.currentWeek} of ${data.roadmap.totalWeeks}`}>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase text-faint">Total</p>
                  <p className="text-lg font-bold text-ink">{data.roadmap.totalWeeks}</p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase text-faint">Completed</p>
                  <p className="text-lg font-bold text-ink">{data.roadmap.completedWeeks}</p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase text-faint">Current</p>
                  <p className="text-lg font-bold text-ink">{data.roadmap.currentWeek}</p>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">{data.roadmap.completedWeeks} weeks complete</span>
                  <span className="font-semibold text-muted">{data.roadmap.completionPercentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-cyan-100 dark:bg-cyan-500/15">
                  <div className="h-full rounded-full bg-cyan-600" style={{ width: `${data.roadmap.completionPercentage}%` }} />
                </div>
              </div>
              <p className="text-sm text-muted">Next focus: <span className="font-semibold text-ink">{data.roadmap.nextFocus}</span></p>
              <p className="text-sm text-muted">Strongest skill: {data.analytics.strongestSkill}</p>
              {data.analytics.openSkillGaps !== undefined && (
                <p className="text-sm text-muted">Open skill gaps: {data.analytics.openSkillGaps}</p>
              )}
            </div>
          </ChartCard>
        )}
        <ChartCard title="Recommendations" subtitle={`Weakest skill: ${data.analytics.weakestSkill}`}>
          <DetailList items={recommendationItems} />
        </ChartCard>
      </div>
    </div>
  )
}
