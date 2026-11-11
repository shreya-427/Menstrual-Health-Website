/**
 * InsightsPage — Phase 4 will replace this with:
 *   StatCard, CycleLengthChart, SymptomFreqChart, TemplateSummary
 */
export default function InsightsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Insights</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg cycle length', value: '—', unit: 'days' },
          { label: 'Avg period duration', value: '—', unit: 'days' },
          { label: 'Cycles logged', value: '—', unit: '' },
          { label: 'Variability', value: '—', unit: '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="card text-center">
            <p className="text-3xl font-bold text-brand-purple">
              {value}
              {unit && <span className="text-sm font-normal text-brand-muted ml-1">{unit}</span>}
            </p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholders */}
      <div className="card">
        <p className="section-heading">Cycle length history</p>
        <div className="h-40 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-brand-muted dark:text-brand-muted-dark text-sm">
          Chart will appear after logging 2+ periods (Phase 4)
        </div>
      </div>

      <div className="card">
        <p className="section-heading">Symptom frequency</p>
        <div className="h-32 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-brand-muted dark:text-brand-muted-dark text-sm">
          Chart will appear after logging symptoms (Phase 4)
        </div>
      </div>
    </div>
  )
}
