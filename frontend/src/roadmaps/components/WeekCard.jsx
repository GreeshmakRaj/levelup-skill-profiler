import SkillBadge from "./SkillBadge";
import CourseCard from "./CourseCard";
import YoutubeCard from "./YoutubeCard";

export default function WeekCard({ week }) {
  const { skills = [], activities = [], courses = [], youtube_videos = [] } = week;

  return (
    <div className="bg-white dark:bg-surface p-4 rounded-lg">
      {skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <SkillBadge key={index} skill={skill} variant={index % 3 === 0 ? "default" : index % 3 === 1 ? "secondary" : "accent"} />
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
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {courses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Courses</h3>
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        </div>
      )}

      {youtube_videos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">YouTube Videos</h3>
          <div className="space-y-3">
            {youtube_videos.slice(0, 2).map((video, index) => (
              <YoutubeCard key={index} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
