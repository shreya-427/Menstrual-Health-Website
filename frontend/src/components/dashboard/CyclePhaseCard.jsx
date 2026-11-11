/**
 * CyclePhaseCard — current cycle day and estimated phase.
 *
 * Props: result (PredictionResult)
 */

const PHASE_CONFIG = {
  menstrual:            { label: 'Menstrual phase',   color: 'text-brand-pink-dark dark:text-brand-pink',   bg: 'bg-brand-pink/10'   },
  follicular:           { label: 'Follicular phase',  color: 'text-brand-teal-dark dark:text-brand-teal',   bg: 'bg-brand-teal/10'   },
  ovulatory_estimated:  { label: 'Estimated mid-cycle',color: 'text-brand-purple dark:text-brand-purple',   bg: 'bg-brand-purple/10' },
  luteal:               { label: 'Luteal phase',      color: 'text-brand-purple dark:text-brand-purple',   bg: 'bg-brand-purple/10' },
  unknown:              { label: 'Phase unknown',     color: 'text-brand-muted dark:text-brand-muted-dark', bg: 'bg-gray-100 dark:bg-white/5' },
}

export default function CyclePhaseCard({ result }) {
  const { currentCycleDay, currentPhase, dataQuality, weightedMeanCycleLength } = result
  const config = PHASE_CONFIG[currentPhase] ?? PHASE_CONFIG.unknown

  // Progress ring: fraction of average cycle completed
  const progress = (currentCycleDay && weightedMeanCycleLength)
    ? Math.min(currentCycleDay / weightedMeanCycleLength, 1)
    : 0
  const r = 30
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference * (1 - progress)

  return (
    <div className="card flex items-center gap-5">
      {/* SVG progress ring */}
      <div className="shrink-0" aria-hidden="true">
        <svg width="80" height="80" viewBox="0 0 80 80">
          {/* Track */}
          <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100 dark:text-white/10" />
          {/* Progress */}
          <circle
            cx="40" cy="40" r={r} fill="none"
            stroke="currentColor" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
            className={config.color}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Day number */}
          <text x="40" y="45" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor" className={config.color}>
            {currentCycleDay ?? '—'}
          </text>
        </svg>
      </div>

      <div className="min-w-0">
        <p className="text-xs text-brand-muted dark:text-brand-muted-dark mb-1">
          {currentCycleDay ? `Cycle day ${currentCycleDay}` : 'No active cycle'}
        </p>
        <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        {currentPhase === 'ovulatory_estimated' && (
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1.5 leading-snug">
            Educational approximation — not a fertility indicator
          </p>
        )}
        {dataQuality === 'no_data' || dataQuality === 'single_cycle' ? (
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">
            {result.disclaimer}
          </p>
        ) : null}
      </div>
    </div>
  )
}
