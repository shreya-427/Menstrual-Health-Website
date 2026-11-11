/**
 * predictionEngine.js
 *
 * Pure statistical cycle prediction module.
 * No network calls. No side effects. No React dependencies.
 * Single export: runPrediction(cycleEntries) → PredictionResult
 *
 * ALGORITHM SUMMARY
 * ─────────────────
 * 1. Sort entries by startDate ascending.
 * 2. Compute integer cycle lengths (days between consecutive startDates).
 * 3. Drop lengths ≤ 0 (data entry errors).
 * 4. Working set = most recent 6 valid lengths (or all if fewer than 6).
 * 5. Weighted mean: most recent cycle gets weight N, next N-1, down to 1.
 * 6. Predicted start = most recent startDate + round(weighted mean).
 * 7. Population SD over working set (unweighted).
 * 8. isIrregular = working set ≥ 3 AND SD > 8 days.
 * 9. Uncertainty range:
 *      - ≥ 3 lengths, regular:   predicted ± round(SD)
 *      - ≥ 3 lengths, irregular: predicted ± round(IQR)
 *      - < 3 lengths:            no range (null)
 * 10. Phase estimation uses the user's own average cycle length as the
 *     denominator — NOT a fixed day-14 assumption. Ovulatory phase is
 *     labeled as educational approximation only.
 *
 * OVULATION NOTE
 * ──────────────
 * The ovulatory_estimated phase is a coarse educational label based on
 * the user's average cycle length. It is NOT a reliable fertility indicator.
 * The UI must display the mandatory disclaimer whenever this phase is active.
 * This engine makes no claims about when ovulation actually occurs.
 */

import { parseISO, differenceInCalendarDays, addDays } from 'date-fns'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_CYCLES      = 6   // maximum working-set size
const IRREGULAR_SD    = 8   // SD threshold (days) above which cycle is irregular
const DEFAULT_DURATION = 5  // fallback average period duration when none logged

// ── Helpers ───────────────────────────────────────────────────────────────────

function median(sorted) {
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function iqr(sorted) {
  const q1 = median(sorted.slice(0, Math.floor(sorted.length / 2)))
  const q3 = median(sorted.slice(Math.ceil(sorted.length / 2)))
  return q3 - q1
}

function populationSD(values) {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function weightedMean(values) {
  // Weight: most recent = N, second most recent = N-1, ..., oldest = 1
  // values[0] is oldest, values[values.length-1] is most recent
  const n = values.length
  let weightedSum = 0
  let totalWeight = 0
  for (let i = 0; i < n; i++) {
    const weight = i + 1  // index 0 → weight 1, index n-1 → weight n
    weightedSum += values[i] * weight
    totalWeight += weight
  }
  return weightedSum / totalWeight
}

function dataQuality(observedLengths) {
  if (observedLengths === 0) return 'no_data'
  if (observedLengths === 1) return 'single_cycle'
  if (observedLengths < 3)   return 'limited'
  return 'sufficient'
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * runPrediction(cycleEntries) → PredictionResult
 *
 * @param {Array} cycleEntries  Array of CycleEntry objects from storageService.
 * @returns {PredictionResult}
 */
export function runPrediction(cycleEntries) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // ── 1. Sort by startDate ascending ──────────────────────────────────────────
  const sorted = [...cycleEntries]
    .map(e => ({ ...e, _start: parseISO(e.startDate) }))
    .sort((a, b) => differenceInCalendarDays(a._start, b._start))

  // ── 2. Compute cycle lengths ─────────────────────────────────────────────────
  const allLengths = []
  for (let i = 1; i < sorted.length; i++) {
    const len = differenceInCalendarDays(sorted[i]._start, sorted[i - 1]._start)
    if (len <= 0) {
      console.warn(`[predictionEngine] Excluding invalid cycle length ${len} between entries ${sorted[i-1].id} and ${sorted[i].id}`)
      continue
    }
    allLengths.push(len)
  }

  // ── 3. Working set (most recent MAX_CYCLES lengths) ──────────────────────────
  const workingSet = allLengths.slice(-MAX_CYCLES)
  const quality = dataQuality(workingSet.length)

  // ── 4. Average period duration ───────────────────────────────────────────────
  const durationsWithEnd = sorted
    .filter(e => e.endDate)
    .map(e => differenceInCalendarDays(parseISO(e.endDate), e._start))
    .filter(d => d > 0 && d <= 14)  // sanity cap at 14 days
  const avgDuration = durationsWithEnd.length > 0
    ? Math.round(durationsWithEnd.reduce((a, b) => a + b, 0) / durationsWithEnd.length)
    : DEFAULT_DURATION

  // ── Early return: no usable cycle lengths ────────────────────────────────────
  if (workingSet.length === 0) {
    return {
      predictedStartDate:      null,
      rangeEarlyDate:          null,
      rangeLateDate:           null,
      weightedMeanCycleLength: null,
      stdDevCycleLength:       null,
      averagePeriodDuration:   avgDuration,
      currentPhase:            'unknown',
      currentCycleDay:         null,
      dataQuality:             sorted.length === 0 ? 'no_data' : 'single_cycle',
      isIrregular:             false,
      cyclesUsed:              0,
      disclaimer: sorted.length === 0
        ? 'Log at least 2 periods to see predictions.'
        : 'Log at least one more period to generate a prediction.',
    }
  }

  // ── 5. Weighted mean and SD ──────────────────────────────────────────────────
  const wMean = weightedMean(workingSet)
  const sd    = populationSD(workingSet)
  const isIrregular = workingSet.length >= 3 && sd > IRREGULAR_SD

  // ── 6. Predicted start date ───────────────────────────────────────────────────
  const mostRecentStart = sorted[sorted.length - 1]._start
  const predictedStartDate = addDays(mostRecentStart, Math.round(wMean))

  // ── 7. Uncertainty range ──────────────────────────────────────────────────────
  let rangeEarlyDate = null
  let rangeLateDate  = null

  if (workingSet.length >= 3) {
    let spread
    if (isIrregular) {
      const sortedSet = [...workingSet].sort((a, b) => a - b)
      spread = Math.round(iqr(sortedSet))
    } else {
      spread = Math.round(sd)
    }
    // Minimum spread of 1 day so the range is never a single point
    spread = Math.max(spread, 1)
    rangeEarlyDate = addDays(predictedStartDate, -spread)
    rangeLateDate  = addDays(predictedStartDate,  spread)
  }

  // ── 8. Current cycle day ──────────────────────────────────────────────────────
  const daysSinceLastStart = differenceInCalendarDays(today, mostRecentStart)
  const currentCycleDay = daysSinceLastStart >= 0 ? daysSinceLastStart + 1 : null

  // ── 9. Phase estimation ───────────────────────────────────────────────────────
  // Uses the user's own average cycle length — not a fixed day-14 assumption.
  // The ovulatory window is an educational approximation only.
  let currentPhase = 'unknown'
  if (currentCycleDay !== null) {
    const midCycle     = Math.round(wMean / 2)
    const ovulatoryLow  = midCycle - 2
    const ovulatoryHigh = midCycle + 2

    if (currentCycleDay <= avgDuration) {
      currentPhase = 'menstrual'
    } else if (currentCycleDay < ovulatoryLow) {
      currentPhase = 'follicular'
    } else if (currentCycleDay <= ovulatoryHigh) {
      currentPhase = 'ovulatory_estimated'  // educational label only — see disclaimer
    } else {
      currentPhase = 'luteal'
    }

    // If we're past the predicted start (cycle running long), fall back to unknown
    if (daysSinceLastStart >= Math.round(wMean) + Math.round(sd) + 5) {
      currentPhase = 'unknown'
    }
  }

  // ── 10. Disclaimer text ────────────────────────────────────────────────────────
  let disclaimer = 'This is an estimate based on your logged history, not a medical prediction.'
  if (quality === 'limited') {
    disclaimer = 'Low confidence — fewer than 3 observed cycles. Predictions will improve as you log more periods.'
  } else if (isIrregular) {
    disclaimer = 'Your cycles vary significantly. This estimate may be less reliable. The range shown reflects your cycle variability.'
  }

  return {
    predictedStartDate,
    rangeEarlyDate,
    rangeLateDate,
    weightedMeanCycleLength: Math.round(wMean * 10) / 10,
    stdDevCycleLength:       Math.round(sd * 10) / 10,
    averagePeriodDuration:   avgDuration,
    currentPhase,
    currentCycleDay,
    dataQuality:             quality,
    isIrregular,
    cyclesUsed:              workingSet.length,
    disclaimer,
  }
}
