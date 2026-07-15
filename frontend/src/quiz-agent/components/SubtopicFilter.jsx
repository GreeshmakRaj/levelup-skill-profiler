import { useState, useId } from 'react'

export function SubtopicFilter({ subtopics, onChange }) {
  const id = useId();
  const [selected, setSelected] = useState(new Set(subtopics));
  const [hasInteracted, setHasInteracted] = useState(false);

  const allSelected = selected.size === subtopics.length;
  const someSelected = selected.size > 0;

  const isSelectAllDisabled = !hasInteracted;

  function toggle(subtopic) {
    if (!hasInteracted) setHasInteracted(true);
    const next = new Set(selected);
    next.has(subtopic) ? next.delete(subtopic) : next.add(subtopic);
    setSelected(next);
    onChange?.([...next]);
  }

  function toggleAll() {
    if (!hasInteracted) setHasInteracted(true);
    const next = allSelected ? new Set() : new Set(subtopics);
    setSelected(next);
    onChange?.([...next]);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Subtopics
      </p>

      {/* Select All (Moved to top) */}
      <div className="border-b border-line pb-2 mb-2">
        <label
          htmlFor={`${id}-all`}
          className={`flex items-center gap-2.5 text-sm group ${
            isSelectAllDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
          title={isSelectAllDisabled ? "All topics selected by default" : ""}
        >
          <input
            id={`${id}-all`}
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={toggleAll}
            disabled={isSelectAllDisabled}
            className={`accent-primary w-4 h-4 rounded ${
              isSelectAllDisabled ? "cursor-not-allowed grayscale" : "cursor-pointer"
            }`}
          />
          <span className={`font-medium ${
            isSelectAllDisabled 
              ? "text-muted" 
              : "text-ink group-hover:text-primary transition-colors"
          }`}>
            Select All
          </span>
        </label>
      </div>

      {/* Individual subtopics */}
      <div className="space-y-1.5">
        {subtopics.map((subtopic) => (
          <label
            key={subtopic}
            htmlFor={`${id}-${subtopic}`}
            className="flex items-center gap-2.5 text-sm cursor-pointer group"
          >
            <input
              id={`${id}-${subtopic}`}
              type="checkbox"
              checked={selected.has(subtopic)}
              onChange={() => toggle(subtopic)}
              className="accent-primary w-4 h-4 rounded cursor-pointer"
            />
            <span className="text-ink group-hover:text-primary transition-colors">
              {subtopic}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}