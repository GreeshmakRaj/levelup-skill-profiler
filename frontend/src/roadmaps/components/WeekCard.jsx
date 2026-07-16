import SkillBadge from './SkillBadge'
import CourseCard from './CourseCard'

export default function WeekCard({ week }) {
  const { skills, activities, courses } = week
  
  return (
    <div className="bg-white dark:bg-surface p-4 rounded-lg">
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <SkillBadge key={index} skill={skill} variant={index % 3 === 0 ? 'default' : index % 3 === 1 ? 'secondary' : 'accent'} />
            ))}
          </div>
        </div>
      )}
      
      {activities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Activities</h3>
          <ul className="space-y-2">
            {activities.map((activity, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-ink">
                <svg className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {courses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Courses</h3>
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
