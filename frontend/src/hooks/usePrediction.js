/**
 * usePrediction — React hook that runs the prediction engine reactively.
 *
 * Re-runs whenever cycleEntries changes.
 * Returns a PredictionResult (or a no_data result if entries is empty).
 */
import { useMemo } from 'react'
import { runPrediction } from '../logic/predictionEngine.js'

export function usePrediction(cycleEntries) {
  return useMemo(() => runPrediction(cycleEntries), [cycleEntries])
}
