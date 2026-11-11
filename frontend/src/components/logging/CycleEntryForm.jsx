/**
 * CycleEntryForm — log or edit a period start/end date.
 *
 * Props:
 *   initial   CycleEntry | null   — pre-fill for editing; null for new entry
 *   onSave    (entry) => void
 *   onCancel  () => void
 */
import { useState } from 'react'

export default function CycleEntryForm({ initial = null, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10)

  const [startDate, setStartDate] = useState(initial?.startDate ?? today)
  const [endDate,   setEndDate]   = useState(initial?.endDate   ?? '')
  const [notes,     setNotes]     = useState(initial?.notes     ?? '')
  const [error,     setError]     = useState('')

  function validate() {
    if (!startDate) return 'Period start date is required.'
    if (endDate && endDate < startDate) return 'End date cannot be before start date.'
    if (startDate > today) return 'Start date cannot be in the future.'
    return ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    onSave({
      ...(initial ?? {}),
      startDate,
      endDate:  endDate || null,
      notes:    notes.trim() || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start date */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            Period start date <span className="text-brand-pink">*</span>
          </label>
          <input
            id="start-date"
            type="date"
            required
            max={today}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10
                       bg-white dark:bg-white/5 px-3 py-2 text-sm
                       text-gray-800 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        {/* End date */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
          >
            Period end date{' '}
            <span className="text-brand-muted dark:text-brand-muted-dark text-xs font-normal">
              (optional)
            </span>
          </label>
          <input
            id="end-date"
            type="date"
            min={startDate}
            max={today}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10
                       bg-white dark:bg-white/5 px-3 py-2 text-sm
                       text-gray-800 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="cycle-notes"
          className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
        >
          Notes{' '}
          <span className="text-brand-muted dark:text-brand-muted-dark text-xs font-normal">
            (optional)
          </span>
        </label>
        <textarea
          id="cycle-notes"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          className="w-full rounded-xl border border-gray-200 dark:border-white/10
                     bg-white dark:bg-white/5 px-3 py-2 text-sm resize-none
                     text-gray-800 dark:text-gray-100 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
      </div>

      {/* Validation error */}
      {error && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary text-sm">
          {initial ? 'Save changes' : 'Log period'}
        </button>
      </div>
    </form>
  )
}
