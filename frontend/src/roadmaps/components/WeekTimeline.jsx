export default function WeekTimeline({ weeks, selectedWeek, onWeekSelect }) {
  return (
    <div className="space-y-2">
      {weeks.map((week) => (
        <button
          key={week.week}
          onClick={() => onWeekSelect(week.week)}
          className={`w-full text-left p-4 rounded-xl border transition-all ${
            selectedWeek === week.week
              ? 'bg-brand-50 border-brand-300 dark:bg-brand-500/15 dark:border-brand-500/30'
              : 'bg-card border-line hover:border-brand-200 hover:bg-surface'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  selectedWeek === week.week
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface text-muted'
                }`}>
                  Week {week.week}
                </span>
              </div>
              <p className="text-sm font-medium text-ink line-clamp-2">{week.focus}</p>
            </div>
            
            <div className="flex flex-col gap-1 text-xs text-faint shrink-0">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.001 3.001 0 00-.872 1.884l-.1.666A1 1 0 0115 19h-6a1 1 0 01-.995-1.083l-.1-.666a3 3 0 00-.872-1.884l-.347-.347z" />
                </svg>
                {week.skills.length}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {week.activities.length}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {week.courses.length}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
