/**
 * QuickStatRow — three summary stats in a row.
 *
 * Props:
 *   entries   CycleEntry[]
 *   result    PredictionResult
 */
import { format, parseISO } from 'date-fns'

export default function QuickStatRow({ entries, result }) {
  const { weightedMeanCycleLength, averagePeriodDuration } = result

  const lastEntry = entries.length > 0
    ? [...entries].sort((a, b) => b.startDate.localeCompare(a.startDate))[0]
    : null

  const stats = [
    {
      label: 'Avg cycle length',
      value: weightedMeanCycleLength ? `${weightedMeanCycleLength}` : '—',
      unit:  weightedMeanCycleLength ? 'days' : '',
    },
    {
      label: 'Avg period duration',
      value: averagePeriodDuration ? `${averagePeriodDuration}` : '—',
      unit:  averagePeriodDuration ? 'days' : '',
    },
    {
      label: 'Last period',
      value: lastEntry ? format(parseISO(lastEntry.startDate), 'MMM d') : '—',
      unit:  '',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, unit }) => (
        <div key={label} className="card text-center">
          <p className="text-2xl font-bold text-brand-purple">
            {value}
            {unit && <span className="text-sm font-normal text-brand-muted ml-1">{unit}</span>}
          </p>
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
