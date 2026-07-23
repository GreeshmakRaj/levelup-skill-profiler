import { useNavigate } from "react-router-dom";

export default function RoadmapCard({ roadmap }) {
  const navigate = useNavigate();
  const { roadmap_id, target_role, plan, created_at } = roadmap;

  const handleViewRoadmap = () => {
    navigate(`/roadmaps-list?skillid=${roadmap.skill_id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="card p-5 hover:border-brand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-faint">Target Role</p>
          <h3 className="font-semibold text-ink text-lg mb-1">{target_role}</h3>
          <p className="text-sm text-muted">From {roadmap.current_role}</p>
          <span className="text-xs text-muted">{formatDate(created_at)}</span>
        </div>
      </div>

      <p className="text-sm text-muted line-clamp-2 mb-4">{plan.summary}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-faint">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {plan.total_weeks} weeks
          </span>
        </div>

        <button onClick={handleViewRoadmap} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors">
          View Roadmap
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
