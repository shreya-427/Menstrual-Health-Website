/**
 * LogPage — Phase 2 will replace this with:
 *   CycleEntryForm, SymptomLogForm, RecentEntriesList
 */
export default function LogPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log</h1>

      {/* Security notice — always visible until security is reviewed */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/40 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Development notice:</strong> Security features are not yet active.
        All stored data is currently unencrypted. A teammate is implementing encryption.
        Use only synthetic test data until the security review is complete.
      </div>

      {/* Period logging card */}
      <div className="card space-y-4">
        <p className="section-heading">Log a period</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Period start date
            </label>
            <input
              type="date"
              disabled
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5
                         px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Period end date <span className="text-brand-muted text-xs">(optional)</span>
            </label>
            <input
              type="date"
              disabled
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5
                         px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">Logging will be enabled in Phase 2.</p>
      </div>

      {/* Symptom logging card */}
      <div className="card space-y-3">
        <p className="section-heading">Log symptoms</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Flow, cramps, mood, energy, and notes will be available in Phase 2.
        </p>
      </div>
    </div>
  )
}
