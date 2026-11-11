/**
 * RecentEntriesList — displays the last 5 cycle entries with edit and delete.
 *
 * Props:
 *   entries   CycleEntry[]
 *   onEdit    (entry) => void
 *   onDelete  (id) => void
 */
import { useState } from 'react'
import { format, parseISO } from 'date-fns'

function fmt(isoDate) {
  if (!isoDate) return '—'
  try { return format(parseISO(isoDate), 'MMM d, yyyy') } catch { return isoDate }
}

export default function RecentEntriesList({ entries, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  // Most recent 5, newest first
  const recent = [...entries]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 5)

  if (recent.length === 0) {
    return (
      <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
        No periods logged yet. Use the form above to log your first period.
      </p>
    )
  }

  return (
    <ul className="space-y-2" aria-label="Recent cycle entries">
      {recent.map(entry => (
        <li
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-xl
                     bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10
                     px-4 py-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {fmt(entry.startDate)}
              {entry.endDate && (
                <span className="text-brand-muted dark:text-brand-muted-dark font-normal">
                  {' '}→ {fmt(entry.endDate)}
                </span>
              )}
            </p>
            {entry.notes && (
              <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-0.5 truncate">
                {entry.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {confirmId === entry.id ? (
              <>
                <button
                  onClick={() => { onDelete(entry.id); setConfirmId(null) }}
                  className="text-xs text-red-500 dark:text-red-400 font-medium px-2 py-1 rounded-lg
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="text-xs text-brand-muted dark:text-brand-muted-dark px-2 py-1 rounded-lg
                             hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onEdit(entry)}
                  aria-label={`Edit period starting ${fmt(entry.startDate)}`}
                  className="text-xs text-brand-purple font-medium px-2 py-1 rounded-lg
                             hover:bg-brand-purple/10 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmId(entry.id)}
                  aria-label={`Delete period starting ${fmt(entry.startDate)}`}
                  className="text-xs text-red-400 font-medium px-2 py-1 rounded-lg
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
