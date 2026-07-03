import { useEffect, useRef, useState } from 'react'
import { AI_ROLES } from '../../constants/roles'

/**
 * Clean searchable role dropdown (combobox).
 * Lets the user filter the predefined AI/software role list and pick one,
 * or type a custom value if none matches.
 */
export default function RoleSelect({
  value,
  onChange,
  options = AI_ROLES,
  placeholder = 'Search and select a role…',
  id,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options
  const showCustom = q && !options.some((o) => o.toLowerCase() === q)

  const select = (val) => {
    onChange(val)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        className="input flex items-center justify-between text-left"
      >
        <span className={value ? 'text-ink' : 'text-faint'}>
          {value || placeholder}
        </span>
        <svg className={`w-4 h-4 text-faint transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full bg-card rounded-xl border border-line shadow-lift overflow-hidden animate-scaleIn origin-top">
          <div className="p-2 border-b border-line">
            <input
              autoFocus
              className="input"
              placeholder="Type to search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filtered.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => select(o)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-surface transition-colors ${
                    value === o ? 'text-brand-600 dark:text-brand-400 font-medium bg-brand-50 dark:bg-brand-500/10' : 'text-ink'
                  }`}
                >
                  {o}
                </button>
              </li>
            ))}
            {showCustom && (
              <li>
                <button
                  type="button"
                  onClick={() => select(query.trim())}
                  className="w-full text-left px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-surface"
                >
                  Use “{query.trim()}”
                </button>
              </li>
            )}
            {filtered.length === 0 && !showCustom && (
              <li className="px-4 py-3 text-sm text-faint text-center">No roles found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
