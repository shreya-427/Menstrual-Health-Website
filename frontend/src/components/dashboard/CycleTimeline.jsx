/**
 * CycleTimeline — horizontal bar showing position in the current cycle.
 *
 * Props: result (PredictionResult)
 *
 * Renders a segmented bar: menstrual | follicular | mid-cycle | luteal
 * with a marker for the current day. Each segment is labeled with its
 * approximate phase name and is clearly marked as an estimate.
 */

const PHASE_COLORS = {
  menstrual:           'bg-brand-pink',
  follicular:          'bg-brand-teal',
  ovulatory_estimated: 'bg-brand-purple',
  luteal:              'bg-brand-purple/50',
}

export default function CycleTimeline({ result }) {
  const { currentCycleDay, weightedMeanCycleLength, averagePeriodDuration, currentPhase } = result

  if (!weightedMeanCycleLength || !currentCycleDay) {
    return (
      <div className="card">
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark text-center py-2">
          Cycle timeline will appear once predictions are available.
        </p>
      </div>
    )
  }

  const total = Math.round(weightedMeanCycleLength)
  const dur   = averagePeriodDuration ?? 5
  const mid   = Math.round(total / 2)

  // Segment widths as percentages of total cycle length
  const segments = [
    { key: 'menstrual',           label: 'Menstrual',      days: dur,          phase: 'menstrual' },
    { key: 'follicular',          label: 'Follicular',     days: mid - dur - 2, phase: 'follicular' },
    { key: 'ovulatory_estimated', label: 'Mid-cycle est.', days: 4,            phase: 'ovulatory_estimated' },
    { key: 'luteal',              label: 'Luteal',         days: total - mid - 2, phase: 'luteal' },
  ].filter(s => s.days > 0)

  // Normalize to 100%
  const totalDays = segments.reduce((a, s) => a + s.days, 0)
  const markerPct = Math.min((currentCycleDay - 1) / total, 1) * 100

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="section-heading mb-0">Cycle timeline</p>
        <span className="text-xs text-brand-muted dark:text-brand-muted-dark italic">estimated phases</span>
      </div>

      {/* Bar */}
      <div className="relative">
        <div className="flex rounded-full overflow-hidden h-5" aria-hidden="true">
          {segments.map(seg => (
            <div
              key={seg.key}
              className={`${PHASE_COLORS[seg.phase] ?? 'bg-gray-200'} transition-all`}
              style={{ width: `${(seg.days / totalDays) * 100}%` }}
            />
          ))}
        </div>

        {/* Current day marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-800 dark:bg-white rounded-full"
          style={{ left: `${markerPct}%`, transform: 'translateX(-50%)' }}
          aria-label={`Current position: day ${currentCycleDay}`}
        />
      </div>

      {/* Segment labels */}
      <div className="flex justify-between text-xs text-brand-muted dark:text-brand-muted-dark">
        {segments.map(seg => (
          <span
            key={seg.key}
            className={currentPhase === seg.phase ? 'font-semibold text-gray-700 dark:text-gray-200' : ''}
          >
            {seg.label}
          </span>
        ))}
      </div>

      <p className="text-xs text-brand-muted dark:text-brand-muted-dark leading-snug">
        Day <strong>{currentCycleDay}</strong> of ~{total}-day estimated cycle.
        Phase boundaries are approximate and based on your average cycle length.
      </p>
    </div>
  )
}
