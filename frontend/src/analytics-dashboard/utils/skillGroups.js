const SKILL_GROUPS = {
  Backend: [
    "python",
    "java",
    "go",
    "node",
    "node.js",
    "spring",
    "spring boot",
    "fastapi",
    "django",
    "flask",
    "graphql",
    "rest",
    "rest api",
    "rest apis",
    "sql",
    "mysql",
    "postgres",
    "mongodb",
    "mongo db",
    "mango db",
    "redis",
    "kafka",
    "maven",
    "intellij",
    "eclipse"
  ],

  Frontend: [
    "react",
    "angular",
    "vue",
    "next",
    "javascript",
    "typescript",
    "html",
    "css",
    "tailwind"
  ],

  DevOps: [
    "git",
    "github",
    "jenkins",
    "docker",
    "kubernetes",
    "aws",
    "amazon s3",
    "azure",
    "terraform",
    "cloudbees",
    "linux",
    "sourcetree"
  ],

  AI: [
    "rag",
    "llm",
    "genai",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "nlp",
    "openai"
  ],

  Testing: [
    "selenium",
    "webdriver",
    "play write",
    "playwright",
    "soapui",
    "testng",
    "bdd",
    "pom",
    "cucumber",
    "jira",
    "octane",
    "hp alm",
    "rest assured",
    "stlc",
    "sdlc",
    "keyword-driven",
    "data-driven",
    "vbscript",
    "splunk"
  ]
}

const COLORS = {
  Backend: "#3B82F6",
  Frontend: "#10B981",
  DevOps: "#F97316",
  AI: "#8B5CF6",
  Testing: "#EC4899",
  Other: "#64748B"
}

export function groupSkills(skills = []) {
  const grouped = {}

  Object.keys(COLORS).forEach(group => {
    grouped[group] = {
      label: group,
      value: 0,
      color: COLORS[group],
      skills: []
    }
  })

  skills.forEach(item => {
    const skillName = item.label.toLowerCase()

    let groupName = "Other"

    for (const [group, keywords] of Object.entries(SKILL_GROUPS)) {
      if (keywords.some(keyword => skillName.includes(keyword))) {
        groupName = group
        break
      }
    }

    grouped[groupName].value += item.value

    grouped[groupName].skills.push({
      skill: item.label,
      employees: item.value
    })
  })
    const total = Object.values(grouped).reduce(
    (sum, item) => sum + item.value,
    0
    )

    return Object.values(grouped)
    .filter(group => group.value > 0)
    .map(group => ({
        ...group,
        percentage: Math.round((group.value / total) * 100)
    }))
}