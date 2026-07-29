import { useMemo, useEffect, useState } from 'react'

import ChartCard from '../components/ChartCard'
import DetailList from '../components/DetailList'
import SkillDonutChart from '../components/SkillDonutChart'

import { groupSkills } from '../utils/skillGroups'

export default function ManagerView({ data }) {
  // Group all skills into categories
  const groupedSkills = useMemo(
    () => groupSkills(data.distribution || []),
    [data.distribution]
  )

  // Selected category
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Select first category on load
  useEffect(() => {
    if (groupedSkills.length > 0) {
      setSelectedGroup(groupedSkills[0])
    }
  }, [groupedSkills])

  // Team members
  const memberItems = (data.teamMembers || []).map((member) => ({
    title: member.name,
    badge: `${(member.skillScore || 0) * 10} Score`,
    description: `Learning Progress ${member.learningProgress || 0}%`,
  }))

  // Skill gaps
  const gapItems = (data.skillGaps || []).map((gap) => ({
    title: gap.skill,
    badge: `${gap.employeesAffected} affected`,
  }))

  // Skills inside selected category
  const selectedSkillItems =
    selectedGroup?.skills?.map((skill) => ({
      title: skill.skill,
      badge: `${skill.employees} employee${
        skill.employees > 1 ? 's' : ''
      }`,
    })) || []
  return (
    <div className="space-y-4">
      {/* Donut + Selected Skills */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Team Skill Distribution"
          subtitle="Click a category to view its skills"
        >
          <SkillDonutChart
            data={groupedSkills}
            selectedGroup={selectedGroup}
            onSelect={setSelectedGroup}
          />
        </ChartCard>

        <ChartCard
          title={selectedGroup?.label || 'Skills'}
          subtitle={
            selectedGroup
              ? `${selectedGroup.value} employee skill${
                  selectedGroup.value > 1 ? 's' : ''
                }`
              : 'Select a category'
          }
        >
          <DetailList items={selectedSkillItems} />
        </ChartCard>
      </div>

      {/* Team Members + Skill Gaps */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Team Members"
          subtitle={`Top Performer: ${data.analytics?.topPerformer ?? '-'}`}
        >
          <DetailList items={memberItems} />
        </ChartCard>

        <ChartCard
          title="Open Skill Gaps"
          subtitle={`Training Completion ${data.analytics?.trainingCompletionRate ?? 0}%`}
        >
          <DetailList items={gapItems} />
        </ChartCard>
      </div>
    </div>
  )
}