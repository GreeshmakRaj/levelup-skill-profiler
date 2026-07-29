export default function YoutubeCard({ video }) {
  const { title, url } = video;

  const displayTitle = title ? title.split('|')[0].trim() : '';

  const handleVisitVideo = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="card p-4 hover:border-brand-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-ink text-sm mb-1 line-clamp-2">{displayTitle}</h4>
          <p className="text-xs text-muted mb-2">YouTube</p>
        </div>
        <button onClick={handleVisitVideo} disabled={!url} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Visit Course
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
