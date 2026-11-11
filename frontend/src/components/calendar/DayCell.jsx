/**
 * DayCell — a single calendar day cell.
 *
 * Props:
 *   day           Date | null   — null for padding cells before the 1st
 *   isToday       boolean
 *   isPeriod      boolean       — recorded period day
 *   isPredicted   boolean       — predicted period day
 *   hasSymptom    boolean       — symptom log exists for this day
 *   isSelected    boolean
 *   onClick       () => void
 */
export default function DayCell({
  day,
  isToday,
  isPeriod,
  isPredicted,
  hasSymptom,
  isSelected,
  onClick,
}) {
  if (!day) {
    return <div aria-hidden="true" />
  }

  const dayNum = day.getDate()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${isPeriod ? ', period recorded' : ''}${isPredicted ? ', period predicted' : ''}${hasSymptom ? ', symptom logged' : ''}`}
      aria-pressed={isSelected}
      className={[
        'relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl',
        'text-sm transition-colors aspect-square select-none',
        // Selected ring
        isSelected ? 'ring-2 ring-brand-purple ring-offset-1' : '',
        // Today highlight
        isToday
          ? 'bg-brand-purple/10 font-bold text-brand-purple dark:text-brand-purple'
          : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200',
      ].join(' ')}
    >
      <span>{dayNum}</span>

      {/* Indicator dots */}
      <div className="flex gap-0.5 mt-0.5" aria-hidden="true">
        {/* Recorded period — solid pink circle */}
        {isPeriod && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
        )}
        {/* Predicted period — outlined purple circle */}
        {isPredicted && !isPeriod && (
          <span className="w-1.5 h-1.5 rounded-full border border-brand-purple" />
        )}
        {/* Symptom logged — teal dot */}
        {hasSymptom && (
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" />
        )}
      </div>
    </button>
  )
}
