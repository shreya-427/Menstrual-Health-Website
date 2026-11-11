/**
 * TemplateSummary — on-device text summary of cycle pattern.
 * No AI, no network. Generated from local statistics only.
 *
 * Props:
 *   result       PredictionResult
 *   cycleCount   number
 */
export default function TemplateSummary({ result, cycleCount }) {
  const { weightedMeanCycleLength, stdDevCycleLength, averagePeriodDuration, isIrregular, dataQuality } = result

  if (dataQuality === 'no_data' || dataQuality === 'single_cycle') {
    return (
      <p className="text-sm text-brand-muted dark:text-brand-muted-dark">
        Log more periods to generate a cycle summary.
      </p>
    )
  }

  const avg = weightedMeanCycleLength
  const sd  = stdDevCycleLength
  const dur = averagePeriodDuration

  // Categorize cycle length
  let lengthDesc
  if (avg < 21)       lengthDesc = 'shorter than typical (under 21 days)'
  else if (avg <= 35) lengthDesc = `within the typical range (21–35 days)`
  else                lengthDesc = 'longer than typical (over 35 days)'

  const variabilityDesc = isIrregular
    ? `Your cycles vary significantly (±${sd} days), which may make predictions less reliable.`
    : `Your cycles are fairly consistent (±${sd} days).`

  return (
    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
      <p>
        Based on <strong>{cycleCount} recorded cycle{cycleCount !== 1 ? 's' : ''}</strong>,
        your average cycle length is{' '}
        <strong className="text-brand-purple">{avg} days</strong> — {lengthDesc}.
        Your periods last an average of <strong>{dur} days</strong>.
      </p>
      <p className="text-brand-muted dark:text-brand-muted-dark">{variabilityDesc}</p>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark border-t border-gray-100 dark:border-white/10 pt-2 mt-1">
        This summary is generated from your logged data and is not medical advice.
        Cycle length varies naturally between individuals.
      </p>
    </div>
  )
}
