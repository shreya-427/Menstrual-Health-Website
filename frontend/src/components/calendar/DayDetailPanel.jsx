/**
 * DayDetailPanel — shows logged data for a selected calendar day.
 *
 * Props:
 *   date          Date | null
 *   cycleEntry    CycleEntry | null
 *   symptomLog    SymptomLog | null
 *   isPredicted   boolean
 *   onClose       () => void
 *   onLogSymptoms (dateISO) => void   — navigate to log page for this date
 */
import { format } from 'date-fns'

const FLOW_LABELS    = ['', 'Light', 'Light-moderate', 'Moderate', 'Moderate-heavy', 'Heavy']
const MOOD_LABELS    = ['', 'Very low', 'Low', 'Okay', 'Good', 'Great']
const ENERGY_LABELS  = ['', 'Exhausted', 'Tired', 'Moderate', 'Energetic', 'Very energetic']

export default function DayDetailPanel({
  date,
  cycleEntry,
  symptomLog,
  isPredicted,
  onClose,
  onLogSymptoms,
}) {
  if (!date) return null

  const dateLabel = format(date, 'EEEE, MMMM d, yyyy')
  const dateISO   = format(date, 'yyyy-MM-dd')

  return (
    <div
      className="card space-y-4"
      role="region"
      aria-label={`Details for ${dateLabel}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{dateLabel}</h3>
        <button
          onClick={onClose}
          aria-label="Close day details"
          className="text-brand-muted hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Predicted period notice */}
      {isPredicted && !cycleEntry && (
        <div className="rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 px-3 py-2 text-sm text-brand-purple">
          Predicted period day <span className="font-normal text-xs">(estimate — not recorded)</span>
        </div>
      )}

      {/* Cycle entry info */}
      {cycleEntry ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-brand-muted dark:text-brand-muted-dark uppercase tracking-wide">
            Period
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Started {format(new Date(cycleEntry.startDate), 'MMM d')}
            {cycleEntry.endDate
              ? ` · ended ${format(new Date(cycleEntry.endDate), 'MMM d')}`
              : ' · end date not logged'}
          </p>
          {cycleEntry.notes && (
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark italic">{cycleEntry.notes}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">No period recorded for this day.</p>
      )}

      {/* Symptom log */}
      {symptomLog ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-brand-muted dark:text-brand-muted-dark uppercase tracking-wide">
            Symptoms
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-200">
            {symptomLog.flowIntensity != null && (
              <span>Flow: <strong>{FLOW_LABELS[symptomLog.flowIntensity]}</strong></span>
            )}
            {symptomLog.crampSeverity != null && (
              <span>Cramps: <strong>{symptomLog.crampSeverity}/5</strong></span>
            )}
            {symptomLog.mood != null && (
              <span>Mood: <strong>{MOOD_LABELS[symptomLog.mood]}</strong></span>
            )}
            {symptomLog.energyLevel != null && (
              <span>Energy: <strong>{ENERGY_LABELS[symptomLog.energyLevel]}</strong></span>
            )}
            {symptomLog.headache && <span>Headache ✓</span>}
            {symptomLog.bloating  && <span>Bloating ✓</span>}
          </div>
          {symptomLog.notes && (
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark italic">{symptomLog.notes}</p>
          )}
        </div>
      ) : (
        <button
          onClick={() => onLogSymptoms(dateISO)}
          className="btn-ghost text-sm w-full"
        >
          + Log symptoms for this day
        </button>
      )}
    </div>
  )
}
