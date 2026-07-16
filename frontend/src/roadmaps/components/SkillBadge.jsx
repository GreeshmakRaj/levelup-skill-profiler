export default function SkillBadge({ skill, variant = 'default' }) {
  const variants = {
    default: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400 border-brand-200 dark:border-brand-500/30',
    secondary: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 border-violet-200 dark:border-violet-500/30',
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${variants[variant]}`}>
      {skill}
    </span>
  )
}
