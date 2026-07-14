import { useState,useId  } from 'react'


export function SubtopicFilter({ subtopics, onChange }) {
   const id = useId();
  const [selected, setSelected] = useState(new Set(subtopics));

  const allSelected = selected.size === subtopics.length;
  const someSelected = selected.size > 0;

  function toggle(subtopic) {
    const next = new Set(selected);
    next.has(subtopic) ? next.delete(subtopic) : next.add(subtopic);
    setSelected(next);
    onChange?.([...next]);
  }

  function toggleAll() {
    const next = allSelected ? new Set() : new Set(subtopics);
    setSelected(next);
    onChange?.([...next]);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
        Subtopics
      </p>

      {/* Individual subtopics */}
      <div className="space-y-2">
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
              disabled={allSelected}
            />
            <span className="text-ink group-hover:text-primary transition-colors">
              {subtopic}
            </span>
          </label>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-line pt-2 mt-2">
        <label
          htmlFor={`${id}-all`}
          className="flex items-center gap-2.5 text-sm cursor-pointer group"
        >
          <input
            id={`${id}-all`}
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={toggleAll}
            className="accent-primary w-4 h-4 rounded cursor-pointer"
          />
          <span className="font-medium text-muted group-hover:text-primary transition-colors">
            {allSelected ? "De Select All" : "Select all"}
          </span>
        </label>
      </div>
    </div>
  );
}