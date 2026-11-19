/**
 * MonthCalendar — interactive monthly grid calendar.
 *
 * Props:
 *   cycleEntries      CycleEntry[]
 *   symptomLogs       SymptomLog[]
 *   predictedDates    Date[]           — from prediction engine; [] until then
 *   predictionResult  PredictionResult — for per-day phase coloring
 *   onSelectDay       (Date) => void
 *   selectedDay       Date | null
 */
import { useState } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isSameMonth, parseISO, format,
  differenceInCalendarDays,
} from 'date-fns'
import DayCell from './DayCell.jsx'

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Returns the cycle phase for a given day based on the prediction result.
 * Mirrors the phase logic in predictionEngine.js but for any arbitrary date.
 */
function getDayPhase(day, predictionResult) {
  const {
    weightedMeanCycleLength: wMean,
    averagePeriodDuration: avgDuration,
    stdDevCycleLength: sd,
  } = predictionResult

  if (!wMean || !avgDuration) return null

  // Find the most recent cycle start at or before this day
  // by working from the prediction result's mostRecentStart (predictedStart - wMean)
  const { predictedStartDate } = predictionResult
  if (!predictedStartDate) return null

  const mostRecentStart = new Date(predictedStartDate.getTime() - Math.round(wMean) * 86400000)
  const daysSince = differenceInCalendarDays(day, mostRecentStart)
  if (daysSince < 0) return null

  const cycleDay = daysSince + 1
  const midCycle = Math.round(wMean / 2)
  const ovulatoryLow  = midCycle - 2
  const ovulatoryHigh = midCycle + 2

  // If day is too far past the expected next start, don't guess a phase
  if (daysSince >= Math.round(wMean) + Math.round(sd ?? 0) + 5) return null

  if (cycleDay <= avgDuration)       return 'menstrual'
  if (cycleDay < ovulatoryLow)       return 'follicular'
  if (cycleDay <= ovulatoryHigh)     return 'ovulatory_estimated'
  return 'luteal'
}

export default function MonthCalendar({
  cycleEntries = [],
  symptomLogs  = [],
  predictedDates = [],
  predictionResult = {},
  onSelectDay,
  selectedDay,
}) {
  const [viewDate, setViewDate] = useState(new Date())
  const today = new Date()

  const monthStart = startOfMonth(viewDate)
  const monthEnd   = endOfMonth(viewDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Leading padding cells (empty slots before the 1st)
  const leadingPad = getDay(monthStart) // 0 = Sun

  // Build lookup sets for O(1) membership tests
  // Period days: any day that falls within a cycle entry's start→end range
  const periodDaySet = new Set()
  for (const entry of cycleEntries) {
    const start = parseISO(entry.startDate)
    const end   = entry.endDate ? parseISO(entry.endDate) : start
    for (const d of eachDayOfInterval({ start, end })) {
      periodDaySet.add(format(d, 'yyyy-MM-dd'))
    }
  }

  // Symptom days
  const symptomDaySet = new Set(symptomLogs.map(l => l.date.slice(0, 10)))

  // Predicted days
  const predictedDaySet = new Set(predictedDates.map(d => format(d, 'yyyy-MM-dd')))

  function prevMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function nextMonth() {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }
  function goToToday() {
    setViewDate(new Date())
  }

  const monthLabel = format(viewDate, 'MMMM yyyy')
  const isCurrentMonth = isSameMonth(viewDate, today)

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          aria-label="Previous month"
          className="btn-ghost text-sm px-3 py-1"
        >
          ← Prev
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-gray-700 dark:text-gray-200">{monthLabel}</h2>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="text-xs text-brand-purple hover:underline mt-0.5"
            >
              Back to today
            </button>
          )}
        </div>
        <button
          onClick={nextMonth}
          aria-label="Next month"
          className="btn-ghost text-sm px-3 py-1"
        >
          Next →
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {DAY_HEADERS.map(d => (
          <div
            key={d}
            role="columnheader"
            aria-label={d}
            className="text-center text-xs font-medium text-brand-muted dark:text-brand-muted-dark py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-label={monthLabel}>
        {/* Leading padding */}
        {Array.from({ length: leadingPad }, (_, i) => (
          <DayCell key={`pad-${i}`} day={null} />
        ))}

        {/* Actual days */}
        {daysInMonth.map(day => {
          const iso = format(day, 'yyyy-MM-dd')
          const isPeriod = periodDaySet.has(iso)
          return (
            <DayCell
              key={iso}
              day={day}
              isToday={isSameDay(day, today)}
              isPeriod={isPeriod}
              isPredicted={predictedDaySet.has(iso)}
              hasSymptom={symptomDaySet.has(iso)}
              phase={isPeriod ? 'menstrual' : getDayPhase(day, predictionResult)}
              isSelected={selectedDay ? isSameDay(day, selectedDay) : false}
              onClick={() => onSelectDay?.(day)}
            />
          )
        })}
      </div>
    </div>
  )
}
