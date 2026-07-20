import {
  getEmployeeData,
  getExecutiveData,
  getManagerData,
} from './analyticsAPI'

const DEFAULT_MANAGER_ID ='mgr_1001'
const DEFAULT_EMPLOYEE_ID ='usr_9823471'

const SKILL_COLORS = [
  '#0891b2',
  '#10b981',
  '#d97706',
  '#ef4444',
  '#7c3aed',
]

function responseData(response) {
  return response?.data ?? response
}

function employeeViewModel(response) {
  const data = responseData(response)
  return {
    ...data,
    profile: data.employee,
    stats: [
      { label: 'Current Skill Score', value: String(data.summary.currentSkillScore) },
      { label: 'Learning Progress', value: `${data.summary.learningProgress}%` },
      { label: 'Quiz Average', value: `${data.summary.quizAverage}%` },
      { label: 'Certificates', value: String(data.summary.certificationsEarned) },
    ],
    trend: data.charts.skillTrend.map((item) => item.score),
    trendLabels: data.charts.skillTrend.map((item) => item.month),
    skillDistribution: data.charts.skillDistribution.map((item) => ({
      name: item.skill,
      value: item.score,
    })),
    roadmap: data.roadmap ?? null,
    recommendations: data.course_recommendations ?? [],
  }
}

function managerViewModel(response) {
  const data = responseData(response)
  return {
    ...data,
    profile: data.manager,
    stats: [
      { label: 'Team Size', value: String(data.summary.teamSize) },
      { label: 'Avg Skill Score', value: String(data.summary.averageSkillScore) },
      { label: 'Avg Progress', value: `${data.summary.averageLearningProgress}%` },
      { label: 'Pending Trainings', value: String(data.summary.pendingTrainings), negative: true },
    ],
    distribution: data.charts.teamSkillDistribution.map((item, index) => ({
      label: item.skill,
      value: item.employees,
      color: SKILL_COLORS[index % SKILL_COLORS.length],
    })),
    progress: data.teamMembers.map((member) => ({
      name: member.name,
      value: member.learningProgress,
    })),
  }
}

function executiveViewModel(response) {
  const data = responseData(response)
  return {
    ...data,
    profile: data.Executive,
    stats: [
      { label: 'AI Readiness', value: String(data.summary.overallAIReadiness) },
      { label: 'Learning Completion', value: `${data.summary.overallLearningCompletion}%` },
      { label: 'Training ROI', value: `${data.summary.trainingROI}x` },
      { label: 'Training Cost', value: `$${Number(data.summary.trainingCost).toLocaleString()}`, negative: true },
    ],
    completion: data.charts.monthlyAIReadinessTrend.map((item) => item.score),
    trendLabels: data.charts.monthlyAIReadinessTrend.map((item) => item.month),
    score: data.summary.overallAIReadiness,
    readiness: data.charts.departmentReadiness.map((item) => ({
      department: item.department,
      value: item.score,
    })),
  }
}

export async function getEmployeeAnalytics(employeeId = DEFAULT_EMPLOYEE_ID) {
  const response = await getEmployeeData(employeeId)
  return employeeViewModel(response)
}

export async function getManagerAnalytics(managerId = DEFAULT_MANAGER_ID) {
  const response = await getManagerData(managerId)
  return managerViewModel(response)
}

export async function getExecutiveAnalytics() {
  const response = await getExecutiveData()
  return executiveViewModel(response)
}