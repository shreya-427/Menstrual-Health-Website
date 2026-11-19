/**
 * CalendarLegend — color/shape key for calendar indicators.
 * Uses both color AND shape so meaning is never communicated by color alone.
 */
export default function CalendarLegend() {
  return (
    <div className="mt-3 space-y-2">
      {/* Dot indicators */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-brand-muted dark:text-brand-muted-dark">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-pink inline-block shrink-0" aria-hidden="true" />
          Period recorded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-brand-purple inline-block shrink-0" aria-hidden="true" />
          Period predicted <span className="italic">(estimate)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-teal inline-block shrink-0" aria-hidden="true" />
          Symptoms logged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-brand-purple/20 border border-brand-purple inline-block shrink-0" aria-hidden="true" />
          Today
        </span>
      </div>
      {/* Phase background tints */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-brand-muted dark:text-brand-muted-dark">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-pink/15 border border-brand-pink/30 inline-block shrink-0" aria-hidden="true" />
          Menstrual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-teal/10 border border-brand-teal/30 inline-block shrink-0" aria-hidden="true" />
          Follicular
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-purple/10 border border-brand-purple/30 inline-block shrink-0" aria-hidden="true" />
          Est. mid-cycle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-brand-purple/5 border border-brand-purple/20 inline-block shrink-0" aria-hidden="true" />
          Luteal
        </span>
      </div>
    </div>
  )
}
