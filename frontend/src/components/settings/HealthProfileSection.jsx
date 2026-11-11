/**
 * HealthProfileSection — optional personal health profile form.
 *
 * All fields are optional. Partial saves are always allowed.
 * Height and weight are stored in metric (cm / kg) regardless of displayed unit.
 * The UI converts for display; the underlying canonical values never change on toggle.
 *
 * Props:
 *   profile   HealthProfile   — current stored profile (from storageService)
 *   onSave    (payload) => void   — called with { age, heightCm, weightKg, activityLevel }
 *   onClear   () => void          — called after user confirms clear
 */
import { useState, useEffect } from 'react'

// ── Activity level definitions ────────────────────────────────────────────────
const ACTIVITY_LEVELS = [
  { id: 'sedentary',        label: 'Sedentary',        desc: 'Little or no exercise, desk job' },
  { id: 'light',            label: 'Lightly active',   desc: 'Light exercise 1–3 days/week' },
  { id: 'moderate',         label: 'Moderately active',desc: 'Moderate exercise 3–5 days/week' },
  { id: 'very_active',      label: 'Very active',      desc: 'Hard exercise 6–7 days/week' },
  { id: 'extremely_active', label: 'Extremely active', desc: 'Very hard exercise or physical job' },
]

// ── Unit conversion helpers ───────────────────────────────────────────────────
function cmToFtIn(cm) {
  if (cm == null || cm === '') return { ft: '', inches: '' }
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inches = Math.round((totalIn % 12) * 10) / 10
  return { ft, inches }
}

function ftInToCm(ft, inches) {
  const f = parseFloat(ft) || 0
  const i = parseFloat(inches) || 0
  return Math.round((f * 12 + i) * 2.54 * 10) / 10
}

function kgToLb(kg) {
  if (kg == null || kg === '') return ''
  return Math.round(kg * 2.20462 * 10) / 10
}

function lbToKg(lb) {
  return Math.round((parseFloat(lb) / 2.20462) * 10) / 10
}

// ── Validation ────────────────────────────────────────────────────────────────
function validate({ ageStr, heightUnit, heightCmStr, heightFtStr, heightInStr, weightUnit, weightStr }) {
  const errors = {}

  if (ageStr !== '') {
    const n = Number(ageStr)
    if (!Number.isInteger(n) || n < 10 || n > 120) {
      errors.age = 'Age must be a whole number between 10 and 120.'
    }
  }

  if (heightUnit === 'cm') {
    if (heightCmStr !== '') {
      const n = parseFloat(heightCmStr)
      if (isNaN(n) || n < 50 || n > 272) {
        errors.height = 'Height must be between 50 and 272 cm.'
      }
    }
  } else {
    if (heightFtStr !== '' || heightInStr !== '') {
      const ft = parseFloat(heightFtStr) || 0
      const ins = parseFloat(heightInStr) || 0
      if (ft < 1 || ft > 8 || ins < 0 || ins >= 12) {
        errors.height = 'Enter feet (1–8) and inches (0–11).'
      }
    }
  }

  if (weightStr !== '') {
    const n = parseFloat(weightStr)
    if (isNaN(n)) {
      errors.weight = 'Enter a valid number.'
    } else if (weightUnit === 'kg' && (n < 20 || n > 500)) {
      errors.weight = 'Weight must be between 20 and 500 kg.'
    } else if (weightUnit === 'lb' && (n < 44 || n > 1100)) {
      errors.weight = 'Weight must be between 44 and 1100 lb.'
    }
  }

  return errors
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HealthProfileSection({ profile, onSave, onClear }) {
  // Display state — separate from canonical storage values
  const [ageStr,       setAgeStr]       = useState('')
  const [heightUnit,   setHeightUnit]   = useState('cm')   // 'cm' | 'ft_in'
  const [heightCmStr,  setHeightCmStr]  = useState('')
  const [heightFtStr,  setHeightFtStr]  = useState('')
  const [heightInStr,  setHeightInStr]  = useState('')
  const [weightUnit,   setWeightUnit]   = useState('kg')   // 'kg' | 'lb'
  const [weightStr,    setWeightStr]    = useState('')
  const [activityLevel,setActivityLevel]= useState(null)
  const [errors,       setErrors]       = useState({})
  const [clearConfirm, setClearConfirm] = useState(false)
  const [saved,        setSaved]        = useState(false)

  // Populate fields from stored canonical values when profile loads
  useEffect(() => {
    if (!profile) return
    setAgeStr(profile.age != null ? String(profile.age) : '')
    setActivityLevel(profile.activityLevel ?? null)

    // Height — use current heightUnit preference
    if (profile.heightCm != null) {
      if (heightUnit === 'cm') {
        setHeightCmStr(String(profile.heightCm))
      } else {
        const { ft, inches } = cmToFtIn(profile.heightCm)
        setHeightFtStr(String(ft))
        setHeightInStr(String(inches))
      }
    }

    // Weight — use current weightUnit preference
    if (profile.weightKg != null) {
      setWeightStr(
        weightUnit === 'kg'
          ? String(profile.weightKg)
          : String(kgToLb(profile.weightKg))
      )
    }
  // Only re-run when profile identity changes, not on unit toggle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  // ── Unit toggle handlers ───────────────────────────────────────────────────
  function toggleHeightUnit() {
    if (heightUnit === 'cm') {
      // cm → ft/in: convert current display value
      const cm = parseFloat(heightCmStr)
      if (!isNaN(cm) && cm > 0) {
        const { ft, inches } = cmToFtIn(cm)
        setHeightFtStr(String(ft))
        setHeightInStr(String(inches))
      } else {
        setHeightFtStr('')
        setHeightInStr('')
      }
      setHeightUnit('ft_in')
    } else {
      // ft/in → cm
      const ft  = parseFloat(heightFtStr)
      const ins = parseFloat(heightInStr) || 0
      if (!isNaN(ft) && ft > 0) {
        setHeightCmStr(String(ftInToCm(ft, ins)))
      } else {
        setHeightCmStr('')
      }
      setHeightUnit('cm')
    }
  }

  function toggleWeightUnit() {
    if (weightUnit === 'kg') {
      const kg = parseFloat(weightStr)
      setWeightStr(!isNaN(kg) && kg > 0 ? String(kgToLb(kg)) : '')
      setWeightUnit('lb')
    } else {
      const lb = parseFloat(weightStr)
      setWeightStr(!isNaN(lb) && lb > 0 ? String(lbToKg(lb)) : '')
      setWeightUnit('kg')
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSave(e) {
    e.preventDefault()
    const errs = validate({ ageStr, heightUnit, heightCmStr, heightFtStr, heightInStr, weightUnit, weightStr })
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})

    // Build canonical metric payload — null for any empty field
    const age = ageStr !== '' ? parseInt(ageStr, 10) : null

    let heightCm = null
    if (heightUnit === 'cm' && heightCmStr !== '') {
      heightCm = parseFloat(heightCmStr)
    } else if (heightUnit === 'ft_in' && (heightFtStr !== '' || heightInStr !== '')) {
      heightCm = ftInToCm(heightFtStr, heightInStr)
    }

    let weightKg = null
    if (weightStr !== '') {
      weightKg = weightUnit === 'kg'
        ? parseFloat(weightStr)
        : lbToKg(weightStr)
    }

    onSave({ age, heightCm, weightKg, activityLevel })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── Shared styles ──────────────────────────────────────────────────────────
  const inputClass = `w-full rounded-xl border border-gray-200 dark:border-white/10
    bg-white dark:bg-white/5 px-3 py-2 text-sm text-gray-800 dark:text-gray-100
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink`

  const unitToggleClass = `text-xs px-2.5 py-1 rounded-lg font-medium transition-colors
    text-brand-purple hover:bg-brand-purple/10 border border-brand-purple/30`

  const activityBtnClass = (id) => [
    'w-full text-left px-3 py-2 rounded-xl border text-sm transition-colors',
    activityLevel === id
      ? 'bg-brand-purple/20 border-brand-purple text-brand-purple dark:text-brand-purple font-medium'
      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-brand-purple/40',
  ].join(' ')

  return (
    <div className="card space-y-5">
      <div>
        <p className="section-heading">Personal health profile</p>
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
          All fields are optional. Profile data is stored locally and is not encrypted in the current version.
        </p>
      </div>

      <form onSubmit={handleSave} noValidate className="space-y-5">

        {/* ── Age ── */}
        <div>
          <label htmlFor="profile-age" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Age <span className="text-brand-muted dark:text-brand-muted-dark font-normal text-xs">(optional)</span>
          </label>
          <input
            id="profile-age"
            type="number"
            min="10" max="120"
            value={ageStr}
            onChange={e => setAgeStr(e.target.value)}
            placeholder="e.g. 28"
            className={`${inputClass} max-w-xs`}
          />
          {errors.age && <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.age}</p>}
        </div>

        {/* ── Height ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Height <span className="text-brand-muted dark:text-brand-muted-dark font-normal text-xs">(optional)</span>
            </label>
            <button type="button" onClick={toggleHeightUnit} className={unitToggleClass}>
              {heightUnit === 'cm' ? 'Switch to ft / in' : 'Switch to cm'}
            </button>
          </div>

          {heightUnit === 'cm' ? (
            <div className="flex items-center gap-2 max-w-xs">
              <input
                id="profile-height-cm"
                type="number"
                min="50" max="272"
                step="0.1"
                value={heightCmStr}
                onChange={e => setHeightCmStr(e.target.value)}
                placeholder="e.g. 165"
                aria-label="Height in centimetres"
                className={inputClass}
              />
              <span className="text-sm text-brand-muted dark:text-brand-muted-dark shrink-0">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="number"
                min="1" max="8"
                value={heightFtStr}
                onChange={e => setHeightFtStr(e.target.value)}
                placeholder="5"
                aria-label="Height feet"
                className={inputClass}
              />
              <span className="text-sm text-brand-muted dark:text-brand-muted-dark shrink-0">ft</span>
              <input
                type="number"
                min="0" max="11"
                step="0.1"
                value={heightInStr}
                onChange={e => setHeightInStr(e.target.value)}
                placeholder="7"
                aria-label="Height inches"
                className={inputClass}
              />
              <span className="text-sm text-brand-muted dark:text-brand-muted-dark shrink-0">in</span>
            </div>
          )}
          {errors.height && <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.height}</p>}
        </div>

        {/* ── Weight ── */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Weight <span className="text-brand-muted dark:text-brand-muted-dark font-normal text-xs">(optional)</span>
            </label>
            <button type="button" onClick={toggleWeightUnit} className={unitToggleClass}>
              {weightUnit === 'kg' ? 'Switch to lb' : 'Switch to kg'}
            </button>
          </div>
          <div className="flex items-center gap-2 max-w-xs">
            <input
              id="profile-weight"
              type="number"
              min="0"
              step="0.1"
              value={weightStr}
              onChange={e => setWeightStr(e.target.value)}
              placeholder={weightUnit === 'kg' ? 'e.g. 65' : 'e.g. 143'}
              aria-label={`Weight in ${weightUnit === 'kg' ? 'kilograms' : 'pounds'}`}
              className={inputClass}
            />
            <span className="text-sm text-brand-muted dark:text-brand-muted-dark shrink-0">
              {weightUnit === 'kg' ? 'kg' : 'lb'}
            </span>
          </div>
          {errors.weight && <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.weight}</p>}
        </div>

        {/* ── Activity level ── */}
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Typical physical activity level{' '}
            <span className="text-brand-muted dark:text-brand-muted-dark font-normal text-xs">(optional)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACTIVITY_LEVELS.map(({ id, label, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActivityLevel(prev => prev === id ? null : id)}
                aria-pressed={activityLevel === id}
                className={activityBtnClass(id)}
              >
                <span className="font-medium block">{label}</span>
                <span className="text-xs opacity-70">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm">
              Save profile
            </button>
            {saved && (
              <span role="status" className="text-sm text-brand-teal dark:text-brand-teal self-center">
                ✓ Saved
              </span>
            )}
          </div>

          {/* Clear — two-step confirmation */}
          {clearConfirm ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { onClear(); setClearConfirm(false) }}
                className="text-xs font-medium text-red-500 dark:text-red-400 px-2.5 py-1.5 rounded-xl
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Confirm clear
              </button>
              <button
                type="button"
                onClick={() => setClearConfirm(false)}
                className="btn-ghost text-xs px-2.5 py-1.5"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setClearConfirm(true)}
              className="text-xs text-brand-muted dark:text-brand-muted-dark hover:text-red-400
                         transition-colors px-2 py-1"
            >
              Clear profile
            </button>
          )}
        </div>
      </form>

      <p className="text-xs text-brand-muted dark:text-brand-muted-dark border-t border-gray-100 dark:border-white/10 pt-3">
        This information is not used in cycle predictions and is not shared with any server or AI service.
      </p>
    </div>
  )
}
