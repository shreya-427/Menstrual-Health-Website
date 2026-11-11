/**
 * InsightsPage — cycle statistics, charts, and template summary.
 */
import { useCycleData } from '../hooks/useCycleData.js'
import { useSymptomData } from '../hooks/useSymptomData.js'
import { usePrediction } from '../hooks/usePrediction.js'
import StatCard from '../components/insights/StatCard.jsx'
import CycleLengthChart from '../components/insights/CycleLengthChart.jsx'
import SymptomFreqChart from '../components/insights/SymptomFreqChart.jsx'
import TemplateSummary from '../components/insights/TemplateSummary.jsx'

export default function InsightsPage() {
  const { entries } = useCycleData()
  const { logs }    = useSymptomData()
  const result      = usePrediction(entries)

  const {
    weightedMeanCycleLength,
    stdDevCycleLength,
    averagePeriodDuration,
    isIrregular,
    cyclesUsed,
    dataQuality,
  } = result

  // Number of complete cycles (entries - 1, minimum 0)
  const cycleCount = Math.max(0, entries.length - 1)

  // Variability label
  const variability = dataQuality === 'sufficient' && stdDevCycleLength != null
    ? isIrregular ? 'Irregular' : 'Regular'
    : '—'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Insights</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Avg cycle length"
          value={weightedMeanCycleLength}
          unit="days"
          accent="pink"
        />
        <StatCard
          label="Avg period duration"
          value={averagePeriodDuration}
          unit="days"
          accent="purple"
        />
        <StatCard
          label="Cycles logged"
          value={cycleCount > 0 ? cycleCount : null}
          accent="teal"
        />
        <StatCard
          label="Variability"
          value={variability}
          accent="purple"
        />
      </div>

      {/* Cycle length chart */}
      <div className="card">
        <p className="section-heading">Cycle length history</p>
        <CycleLengthChart cycleEntries={entries} />
      </div>

      {/* Symptom frequency chart */}
      <div className="card">
        <p className="section-heading">Symptom frequency</p>
        <SymptomFreqChart symptomLogs={logs} />
      </div>

      {/* Text summary */}
      <div className="card">
        <p className="section-heading">Cycle summary</p>
        <TemplateSummary result={result} cycleCount={cycleCount} />
      </div>

      {/* AI explanation stub */}
      <div className="card opacity-60">
        <p className="section-heading">AI-powered explanation</p>
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
          Coming soon — AI cycle insights will be available once the backend is connected.
        </p>
        <button disabled className="btn-ghost text-sm mt-2 cursor-not-allowed opacity-50">
          Generate AI explanation
        </button>
      </div>
    </div>
  )
}
