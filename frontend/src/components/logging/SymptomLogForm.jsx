/**
 * SymptomLogForm — log daily symptoms for a given date.
 *
 * Props:
 *   date      string (ISO date)    — the date being logged
 *   initial   SymptomLog | null    — pre-fill for editing
 *   onSave    (log) => void
 *   onCancel  () => void
 */
import { useState } from 'react'

// Labelled scale helper
function ScaleInput({ id, label, min, max, value, onChange, lowLabel, highLabel }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
        {label}
        <span className="ml-2 font-bold text-brand-purple">
          {value !== null ? value : '—'}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value ?? min}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-brand-purple"
      />
      <div className="flex justify-between text-xs text-brand-muted dark:text-brand-muted-dark mt-0.5">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}

const MOOD_LABELS = ['', 'Very low', 'Low', 'Okay', 'Good', 'Great']
const ENERGY_LABELS = ['', 'Exhausted', 'Tired', 'Moderate', 'Energetic', 'Very energetic']

export default function SymptomLogForm({ date, initial = null, onSave, onCancel }) {
  const [flow,     setFlow]     = useState(initial?.flowIntensity ?? null)
  const [cramps,   setCramps]   = useState(initial?.crampSeverity ?? null)
  const [mood,     setMood]     = useState(initial?.mood          ?? null)
  const [energy,   setEnergy]   = useState(initial?.energyLevel   ?? null)
  const [headache, setHeadache] = useState(initial?.headache      ?? false)
  const [bloating, setBloating] = useState(initial?.bloating      ?? false)
  const [notes,    setNotes]    = useState(initial?.notes         ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...(initial ?? {}),
      date,
      flowIntensity:      flow,
      crampSeverity:      cramps,
      mood,
      energyLevel:        energy,
      headache,
      bloating,
      additionalSymptoms: [],
      notes:              notes.trim() || null,
    })
  }

  const toggleClass = (active) =>
    [
      'px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors',
      active
        ? 'bg-brand-pink/20 border-brand-pink text-brand-pink-dark dark:text-brand-pink'
        : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-brand-pink/50',
    ].join(' ')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Flow intensity */}
      <ScaleInput
        id="flow"
        label="Flow intensity"
        min={1} max={5}
        value={flow}
        onChange={setFlow}
        lowLabel="Light (1)"
        highLabel="Heavy (5)"
      />

      {/* Cramp severity */}
      <ScaleInput
        id="cramps"
        label="Cramp severity"
        min={0} max={5}
        value={cramps}
        onChange={setCramps}
        lowLabel="None (0)"
        highLabel="Severe (5)"
      />

      {/* Mood */}
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Mood
          {mood !== null && (
            <span className="ml-2 font-bold text-brand-purple">{MOOD_LABELS[mood]}</span>
          )}
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setMood(v)}
              className={toggleClass(mood === v)}
              aria-pressed={mood === v}
            >
              {MOOD_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Energy level
          {energy !== null && (
            <span className="ml-2 font-bold text-brand-teal">{ENERGY_LABELS[energy]}</span>
          )}
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setEnergy(v)}
              className={toggleClass(energy === v)}
              aria-pressed={energy === v}
            >
              {ENERGY_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setHeadache(h => !h)}
          className={toggleClass(headache)}
          aria-pressed={headache}
        >
          Headache
        </button>
        <button
          type="button"
          onClick={() => setBloating(b => !b)}
          className={toggleClass(bloating)}
          aria-pressed={bloating}
        >
          Bloating
        </button>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="symptom-notes"
          className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"
        >
          Notes{' '}
          <span className="text-xs text-brand-muted dark:text-brand-muted-dark font-normal">(optional)</span>
        </label>
        <textarea
          id="symptom-notes"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          className="w-full rounded-xl border border-gray-200 dark:border-white/10
                     bg-white dark:bg-white/5 px-3 py-2 text-sm resize-none
                     text-gray-800 dark:text-gray-100 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost text-sm">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary text-sm">
          {initial ? 'Save changes' : 'Save log'}
        </button>
      </div>
    </form>
  )
}
