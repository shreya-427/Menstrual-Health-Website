/**
 * CalendarLegend — color/shape key for calendar indicators.
 * Uses both color AND shape so meaning is never communicated by color alone.
 */
export default function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-brand-muted dark:text-brand-muted-dark mt-3">
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
  )
}
