/**
 * CalendarPage — Phase 2 will replace this with:
 *   MonthCalendar, CalendarLegend, DayDetailPanel
 */
export default function CalendarPage() {
  const today = new Date()
  const monthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h1>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm px-3 py-1">← Prev</button>
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">{monthLabel}</h2>
          <button className="btn-ghost text-sm px-3 py-1">Next →</button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 text-center mb-2">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-xs font-medium text-brand-muted dark:text-brand-muted-dark py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Placeholder grid — 5 rows × 7 cols */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className="aspect-square flex items-center justify-center rounded-xl text-sm
                         text-gray-400 dark:text-gray-600 hover:bg-brand-pink/10 cursor-pointer transition-colors"
            >
              {/* Phase 2 will populate real dates */}
            </div>
          ))}
        </div>

        {/* Legend placeholder */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-brand-muted dark:text-brand-muted-dark">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-brand-pink inline-block" /> Period (recorded)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-dashed border-brand-purple inline-block" /> Period (predicted)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-brand-teal inline-block" /> Symptom logged
          </span>
        </div>
      </div>
    </div>
  )
}
