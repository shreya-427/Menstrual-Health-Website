/**
 * LogPage — period and symptom logging.
 * Uses CycleEntryForm, SymptomLogForm, and RecentEntriesList.
 */
import { useState } from 'react'
import { format } from 'date-fns'
import { useCycleData } from '../hooks/useCycleData.js'
import { useSymptomData } from '../hooks/useSymptomData.js'
import CycleEntryForm from '../components/logging/CycleEntryForm.jsx'
import SymptomLogForm from '../components/logging/SymptomLogForm.jsx'
import RecentEntriesList from '../components/logging/RecentEntriesList.jsx'

// 'period' | 'symptoms'
const TABS = [
  { id: 'period',   label: 'Log period' },
  { id: 'symptoms', label: 'Log symptoms' },
]

export default function LogPage() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { entries, add: addEntry, update: updateEntry, remove: removeEntry } = useCycleData()
  const { logs,    add: addLog   } = useSymptomData()

  const [tab, setTab]             = useState('period')
  const [editEntry, setEditEntry] = useState(null)   // CycleEntry being edited
  const [logDate,   setLogDate]   = useState(today)
  const [saved,     setSaved]     = useState('')     // brief confirmation message

  // ── Period tab ────────────────────────────────────────────────────────────

  async function handleSaveEntry(entry) {
    if (editEntry) {
      await updateEntry({ ...editEntry, ...entry })
      setSaved('Period updated.')
    } else {
      await addEntry(entry)
      setSaved('Period logged.')
    }
    setEditEntry(null)
    setTimeout(() => setSaved(''), 3000)
  }

  // ── Symptom tab ───────────────────────────────────────────────────────────

  // Find existing symptom log for the selected date (for editing)
  const existingLog = logs.find(l => l.date.slice(0, 10) === logDate) ?? null

  async function handleSaveLog(log) {
    await addLog({ ...log, date: logDate })
    setSaved('Symptoms saved.')
    setTimeout(() => setSaved(''), 3000)
  }

  const tabClass = (id) => [
    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
    tab === id
      ? 'bg-brand-pink text-white'
      : 'text-gray-600 dark:text-gray-300 hover:bg-brand-pink/10',
  ].join(' ')

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log</h1>

      {/* Security notice */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700/40 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
        <strong>Development notice:</strong> Security features are not yet active.
        All stored data is currently unencrypted. Use only synthetic test data until the security review is complete.
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={tabClass(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Confirmation banner */}
      {saved && (
        <div role="status" className="rounded-xl bg-brand-teal/10 border border-brand-teal/30 px-4 py-2 text-sm text-brand-teal-dark dark:text-brand-teal">
          ✓ {saved}
        </div>
      )}

      {/* ── Period tab ── */}
      {tab === 'period' && (
        <>
          <div className="card">
            <p className="section-heading">
              {editEntry ? 'Edit period' : 'Log a period'}
            </p>
            <CycleEntryForm
              initial={editEntry}
              onSave={handleSaveEntry}
              onCancel={editEntry ? () => setEditEntry(null) : undefined}
            />
          </div>

          <div className="card">
            <p className="section-heading">Recent periods</p>
            <RecentEntriesList
              entries={entries}
              onEdit={entry => { setEditEntry(entry); window.scrollTo(0, 0) }}
              onDelete={removeEntry}
            />
          </div>
        </>
      )}

      {/* ── Symptom tab ── */}
      {tab === 'symptoms' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-4">
            <p className="section-heading mb-0">Symptoms for</p>
            <input
              type="date"
              value={logDate}
              max={today}
              onChange={e => setLogDate(e.target.value)}
              aria-label="Date to log symptoms for"
              className="rounded-xl border border-gray-200 dark:border-white/10
                         bg-white dark:bg-white/5 px-3 py-1.5 text-sm
                         text-gray-800 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>
          {existingLog && (
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
              A log already exists for this date. Saving will add another entry.
            </p>
          )}
          <SymptomLogForm
            date={logDate}
            onSave={handleSaveLog}
          />
        </div>
      )}
    </div>
  )
}
