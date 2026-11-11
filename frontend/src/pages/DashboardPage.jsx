/**
 * DashboardPage — assembles all prediction and cycle summary components.
 */
import { Link } from 'react-router-dom'
import { useCycleData } from '../hooks/useCycleData.js'
import { usePrediction } from '../hooks/usePrediction.js'
import CyclePhaseCard from '../components/dashboard/CyclePhaseCard.jsx'
import PredictionCard from '../components/dashboard/PredictionCard.jsx'
import CycleTimeline from '../components/dashboard/CycleTimeline.jsx'
import QuickStatRow from '../components/dashboard/QuickStatRow.jsx'

export default function DashboardPage() {
  const { entries, loading } = useCycleData()
  const result = usePrediction(entries)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-brand-muted dark:text-brand-muted-dark text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <Link to="/log" className="btn-primary text-sm">+ Log period</Link>
      </div>

      {/* Current phase and day */}
      <CyclePhaseCard result={result} />

      {/* Mandatory ovulatory window disclaimer — shown when phase is ovulatory_estimated */}
      {result.currentPhase === 'ovulatory_estimated' && (
        <div
          role="note"
          className="rounded-2xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20
                     dark:border-yellow-700/40 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300"
        >
          <strong>Educational note:</strong> The estimated fertile window shown here is based on your
          average cycle length and is not a reliable method for contraception or pregnancy planning.
          Individual cycles vary significantly. Consult a healthcare provider for family planning guidance.
        </div>
      )}

      {/* Prediction */}
      <PredictionCard result={result} />

      {/* Timeline */}
      <CycleTimeline result={result} />

      {/* Summary stats */}
      <QuickStatRow entries={entries} result={result} />

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/calendar"
          className="card flex items-center gap-3 hover:border-brand-pink/40 transition-colors no-underline"
        >
          <span className="text-2xl" aria-hidden="true">📅</span>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Calendar</p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark">View all cycles</p>
          </div>
        </Link>
        <Link
          to="/log"
          className="card flex items-center gap-3 hover:border-brand-pink/40 transition-colors no-underline"
        >
          <span className="text-2xl" aria-hidden="true">✏️</span>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Log</p>
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark">Record symptoms</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
