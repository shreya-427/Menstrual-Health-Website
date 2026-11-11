/**
 * syntheticData.js — DEV ONLY
 *
 * Populates localForage with realistic fake cycle and symptom data.
 * Never imported in production builds (guarded by import.meta.env.DEV).
 * Never contains real personal health information.
 *
 * Usage: call loadSyntheticData() from the browser console,
 *        or use the "Load demo data" button in Settings (dev builds only).
 */
import { saveCycleEntry, saveSymptomLog, clearAllData } from '../services/storageService.js'
import { subDays, format } from 'date-fns'

// 12 months of cycle entries with varied lengths (24–33 days)
const CYCLE_LENGTHS = [28, 30, 27, 31, 29, 28, 26, 30, 33, 27, 29, 28]
// Period durations (days)
const PERIOD_DURATIONS = [5, 6, 4, 5, 5, 6, 4, 5, 5, 4, 5, 5]

export async function loadSyntheticData() {
  await clearAllData()

  const today = new Date()
  let cursor = today

  const savedEntries = []

  // Walk backwards 12 cycles
  for (let i = 0; i < CYCLE_LENGTHS.length; i++) {
    const startDate = subDays(cursor, CYCLE_LENGTHS[i] * i === 0 ? 0 : 0)
    // Build start by subtracting cumulative cycle lengths
    const cycleStart = subDays(
      today,
      CYCLE_LENGTHS.slice(0, i + 1).reduce((a, b) => a + b, 0)
    )
    const cycleEnd = subDays(cycleStart, -PERIOD_DURATIONS[i])

    const entry = await saveCycleEntry({
      startDate: format(cycleStart, 'yyyy-MM-dd'),
      endDate:   format(cycleEnd,   'yyyy-MM-dd'),
      notes:     i === 0 ? 'Heavier than usual' : null,
    })
    savedEntries.push(entry)
  }

  // 3 months of daily symptom logs (roughly 90 days back)
  const symptomDays = 90
  for (let d = 0; d < symptomDays; d += 2) {  // every other day for variety
    const date = format(subDays(today, d), 'yyyy-MM-dd')
    // Vary symptoms based on day-of-cycle approximation
    const inPeriodWindow = d % 28 < 6
    await saveSymptomLog({
      date,
      flowIntensity:  inPeriodWindow ? Math.ceil(Math.random() * 3) + 1 : null,
      crampSeverity:  inPeriodWindow ? Math.ceil(Math.random() * 3) : 0,
      mood:           Math.ceil(Math.random() * 5),
      energyLevel:    Math.ceil(Math.random() * 5),
      headache:       Math.random() > 0.85,
      bloating:       inPeriodWindow && Math.random() > 0.5,
      additionalSymptoms: [],
      notes: null,
    })
  }

  console.info('[syntheticData] Loaded 12 cycle entries and ~45 symptom logs.')
  return { cycleCount: savedEntries.length }
}
