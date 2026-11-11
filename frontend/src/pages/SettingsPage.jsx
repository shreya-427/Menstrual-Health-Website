/**
 * SettingsPage — theme, AI consent, data export, data deletion, dev tools.
 */
import { useState, useEffect } from 'react'
import { getPreferences, savePreferences, getAllData, clearAllData } from '../services/storageService.js'

// ── AI Consent Modal ──────────────────────────────────────────────────────────
function ConsentModal({ onAccept, onDecline }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
    >
      <div className="card w-full max-w-md space-y-4">
        <h2 id="consent-title" className="font-bold text-gray-800 dark:text-gray-100 text-base">
          Enable AI health assistant?
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          When you use the AI chat on the Education page:
        </p>
        <ul className="text-sm text-gray-700 dark:text-gray-200 space-y-1 list-disc list-inside">
          <li>The text you type is sent to IBM's AI servers.</li>
          <li>Your stored cycle and symptom data is <strong>never</strong> transmitted.</li>
          <li>IBM's data retention policies apply to your typed questions.</li>
          <li>Do not type personally identifying information into the chat.</li>
        </ul>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          You can disable this at any time from Settings.
        </p>
        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onDecline} className="btn-ghost text-sm">Cancel</button>
          <button onClick={onAccept} className="btn-primary text-sm">I understand — enable</button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [prefs,          setPrefs]          = useState({ aiConsentGranted: false, themePreference: 'light' })
  const [showModal,      setShowModal]      = useState(false)
  const [deleteConfirm,  setDeleteConfirm]  = useState(false)
  const [statusMsg,      setStatusMsg]      = useState('')
  const [demoStatus,     setDemoStatus]     = useState('')

  useEffect(() => {
    getPreferences().then(setPrefs)
  }, [])

  function flash(msg) {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(''), 4000)
  }

  // ── AI consent ──────────────────────────────────────────────────────────────

  async function handleConsentToggle() {
    if (prefs.aiConsentGranted) {
      // Disable immediately
      const updated = { ...prefs, aiConsentGranted: false }
      await savePreferences(updated)
      setPrefs(updated)
      flash('AI assistant disabled.')
    } else {
      // Show modal before enabling
      setShowModal(true)
    }
  }

  async function handleConsentAccept() {
    const updated = { ...prefs, aiConsentGranted: true }
    await savePreferences(updated)
    setPrefs(updated)
    setShowModal(false)
    flash('AI assistant enabled.')
  }

  // ── Data export ─────────────────────────────────────────────────────────────

  async function handleExport() {
    const data = await getAllData()
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Keep this file secure — it contains personal health information.',
      ...data,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `cycle-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Data exported. Keep the downloaded file secure.')
  }

  // ── Data deletion ───────────────────────────────────────────────────────────

  async function handleDeleteConfirmed() {
    await clearAllData()
    setDeleteConfirm(false)
    setPrefs({ aiConsentGranted: false, themePreference: 'light' })
    flash('All data deleted from this browser. Exported files remain outside this app\'s control.')
  }

  // ── Demo data (dev only) ────────────────────────────────────────────────────

  async function handleLoadDemo() {
    setDemoStatus('Loading…')
    try {
      const { loadSyntheticData } = await import('../data/syntheticData.js')
      const result = await loadSyntheticData()
      setDemoStatus(`✓ Loaded ${result.cycleCount} demo cycles. Refresh the page to see the data.`)
    } catch (e) {
      setDemoStatus('Failed to load demo data.')
      console.error(e)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>

      {/* Consent modal */}
      {showModal && (
        <ConsentModal
          onAccept={handleConsentAccept}
          onDecline={() => setShowModal(false)}
        />
      )}

      {/* Status flash */}
      {statusMsg && (
        <div role="status" className="rounded-xl bg-brand-teal/10 border border-brand-teal/30 px-4 py-2 text-sm text-brand-teal-dark dark:text-brand-teal">
          ✓ {statusMsg}
        </div>
      )}

      {/* Security notice */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/40 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Development notice:</strong> This application is in development.
        Do not enter real personal health information until the security review is complete.
        All stored data is currently unencrypted.
      </div>

      {/* Theme */}
      <div className="card space-y-2">
        <p className="section-heading">Appearance</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Toggle light/dark mode using the ☀️ / 🌙 button in the navigation bar.
        </p>
      </div>

      {/* Security — not yet active */}
      <div className="card space-y-3">
        <p className="section-heading">Privacy &amp; security</p>
        <div className="rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-3 text-sm text-brand-muted dark:text-brand-muted-dark">
          Encryption is not yet active. A teammate is implementing this feature.
          All data stored locally is currently unencrypted.
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-200 space-y-2">
          <p><strong>What stays in your browser:</strong> Cycle dates, symptom records, and notes. Never sent to any server automatically.</p>
          <p><strong>What may be sent to IBM:</strong> Text you type in the AI chat (if enabled). Never your stored health data.</p>
          <p><strong>Browser storage risk:</strong> Data may be lost if your browser clears storage. Export regularly.</p>
          <p><strong>Deletion:</strong> Deleting data removes it from this browser. It is not a forensic erasure and does not affect exported files.</p>
        </div>
      </div>

      {/* AI consent */}
      <div className="card space-y-3">
        <p className="section-heading">AI health assistant</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {prefs.aiConsentGranted ? 'AI assistant is enabled' : 'AI assistant is disabled'}
            </p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-0.5">
              {prefs.aiConsentGranted
                ? 'Questions you type in Education are sent to IBM AI services.'
                : 'Enable to ask questions on the Education page.'}
            </p>
          </div>
          <button
            onClick={handleConsentToggle}
            role="switch"
            aria-checked={prefs.aiConsentGranted}
            className={[
              'relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2',
              prefs.aiConsentGranted ? 'bg-brand-purple' : 'bg-gray-300 dark:bg-white/20',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={[
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                prefs.aiConsentGranted ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>
      </div>

      {/* Data controls */}
      <div className="card space-y-4">
        <p className="section-heading">Your data</p>

        {/* Export */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Export data</p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark">Download all cycles and symptoms as JSON.</p>
          </div>
          <button onClick={handleExport} className="btn-ghost text-sm shrink-0">
            Export
          </button>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/10" />

        {/* Delete */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Delete all data</p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
              Removes all cycles, symptoms, and preferences from this browser.
              Exported files are not affected.
            </p>
          </div>
          {deleteConfirm ? (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleDeleteConfirmed}
                className="text-sm font-medium text-red-500 dark:text-red-400 px-3 py-1.5 rounded-xl
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Confirm delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-sm font-medium text-red-400 px-3 py-1.5 rounded-xl
                         hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
            >
              Delete all
            </button>
          )}
        </div>
      </div>

      {/* Dev tools — only in development builds */}
      {import.meta.env.DEV && (
        <div className="card space-y-3 border-dashed border-2 border-brand-purple/30">
          <p className="section-heading text-brand-purple">Developer tools</p>
          <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
            Load 12 months of synthetic (fake) test data. Clears existing data first.
          </p>
          <button onClick={handleLoadDemo} className="btn-ghost text-sm">
            Load demo data
          </button>
          {demoStatus && (
            <p role="status" className="text-sm text-brand-teal dark:text-brand-teal">{demoStatus}</p>
          )}
        </div>
      )}
    </div>
  )
}
