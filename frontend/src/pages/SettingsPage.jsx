/**
 * SettingsPage — Phase 4 will expand this with:
 *   PassphraseSetup (security teammate), AiConsentToggle, DataExportButton, DeleteAllDataButton
 */
export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>

      {/* Security status notice */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/40 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Development notice:</strong> This application is in development.
        Do not enter real personal health information until the security review is complete.
      </div>

      {/* Theme */}
      <div className="card space-y-3">
        <p className="section-heading">Appearance</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Theme is toggled using the ☀️/🌙 button in the navigation bar.
        </p>
      </div>

      {/* Security — not yet active */}
      <div className="card space-y-3">
        <p className="section-heading">Privacy &amp; security</p>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 text-sm text-brand-muted dark:text-brand-muted-dark">
          Encryption is not yet active. A teammate is implementing this feature.
          All data stored locally is currently unencrypted.
        </div>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          Full privacy controls will be available once the security review is complete.
        </p>
      </div>

      {/* AI consent — placeholder */}
      <div className="card space-y-3">
        <p className="section-heading">AI assistant</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          AI consent settings will be available in Phase 4.
        </p>
      </div>

      {/* Data controls — placeholder */}
      <div className="card space-y-3">
        <p className="section-heading">Your data</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Data export and deletion will be available in Phase 4.
        </p>
        <div className="flex gap-3">
          <button disabled className="btn-ghost opacity-40 cursor-not-allowed text-sm">
            Export data
          </button>
          <button disabled className="text-red-400 font-medium px-4 py-2 rounded-xl opacity-40 cursor-not-allowed text-sm">
            Delete all data
          </button>
        </div>
      </div>
    </div>
  )
}
