/**
 * PredictionCard — predicted next period date and uncertainty range.
 *
 * Props: result (PredictionResult)
 *
 * Mandatory UI rules enforced here:
 *  - No date shown when dataQuality is no_data or single_cycle.
 *  - No range shown when dataQuality is limited (< 3 observed cycles).
 *  - Disclaimer always visible.
 *  - Ovulatory window disclaimer shown separately in CyclePhaseCard.
 */
import { format } from 'date-fns'

function fmtDate(d) {
  if (!d) return null
  try { return format(d, 'MMM d, yyyy') } catch { return null }
}

export default function PredictionCard({ result }) {
  const {
    predictedStartDate,
    rangeEarlyDate,
    rangeLateDate,
    dataQuality,
    isIrregular,
    cyclesUsed,
    disclaimer,
  } = result

  const noData = dataQuality === 'no_data' || dataQuality === 'single_cycle'

  return (
    <div className="card space-y-3">
      <p className="section-heading">Next period prediction</p>

      {noData ? (
        /* Not enough data — show prompt, no date */
        <p className="text-sm text-brand-muted dark:text-brand-muted-dark">{disclaimer}</p>
      ) : (
        <>
          {/* Predicted date */}
          <div>
            <p className="text-3xl font-bold text-brand-pink-dark dark:text-brand-pink">
              {fmtDate(predictedStartDate) ?? '—'}
            </p>

            {/* Range */}
            {rangeEarlyDate && rangeLateDate ? (
              <p className="text-sm text-brand-muted dark:text-brand-muted-dark mt-1">
                Estimated range:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {fmtDate(rangeEarlyDate)} – {fmtDate(rangeLateDate)}
                </span>
              </p>
            ) : (
              <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">
                Range available after logging 3+ periods
              </p>
            )}
          </div>

          {/* Confidence / variability label */}
          <div className={[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
            isIrregular
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              : 'bg-brand-teal/10 text-brand-teal-dark dark:text-brand-teal',
          ].join(' ')}>
            {isIrregular ? '⚠ Irregular cycles' : '✓ Regular cycles'}
            <span className="font-normal opacity-70">· based on {cyclesUsed} cycle{cyclesUsed !== 1 ? 's' : ''}</span>
          </div>

          {/* Disclaimer — always shown */}
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark leading-snug border-t border-gray-100 dark:border-white/10 pt-3">
            {disclaimer}
            {' '}Estimated range is not a statistically validated prediction interval.
          </p>
        </>
      )}
    </div>
  )
}
