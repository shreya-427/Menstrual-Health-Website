/**
 * DashboardPage — Phase 3 will replace this with:
 *   CyclePhaseCard, PredictionCard, CycleTimeline, QuickStatRow
 */
export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>

      {/* Placeholder cycle overview card */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-brand-muted dark:text-brand-muted-dark">Current cycle day</p>
            <p className="text-4xl font-bold text-brand-pink-dark dark:text-brand-pink mt-1">—</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-brand-pink/30 flex items-center justify-center">
            <span className="text-brand-pink text-xs text-center leading-tight">Log a period<br />to start</span>
          </div>
        </div>
        <div className="h-px bg-gray-100 dark:bg-white/10" />
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Estimated phase: <span className="font-medium text-brand-purple">—</span>
        </p>
      </div>

      {/* Placeholder prediction card */}
      <div className="card">
        <p className="section-heading">Next period prediction</p>
        <p className="text-brand-muted dark:text-brand-muted-dark text-sm">
          Log at least 2 periods to see predictions.
        </p>
      </div>

      {/* Placeholder stats row */}
      <div className="grid grid-cols-3 gap-3">
        {['Avg cycle', 'Avg period', 'Last period'].map(label => (
          <div key={label} className="card text-center">
            <p className="text-2xl font-bold text-brand-purple dark:text-brand-purple">—</p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
