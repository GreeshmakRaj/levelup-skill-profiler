// Public API for the Learning Paths module.
// Covers: skill-gap analysis, learning path results.
export { routes as learningPathsRoutes, nav as learningPathsNav } from './route'
export { default as LearningPaths } from './pages/LearningPaths'
export { default as LearningPathCard } from './components/LearningPathCard'
export { analyzeSkills, listMySkills, getSkill, deleteSkill } from './services/skillsApi'
