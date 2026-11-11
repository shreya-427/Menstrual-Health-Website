/**
 * CalendarPage — interactive calendar with period and symptom indicators.
 */
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCycleData } from '../hooks/useCycleData.js'
import { useSymptomData } from '../hooks/useSymptomData.js'
import { usePrediction } from '../hooks/usePrediction.js'
import MonthCalendar from '../components/calendar/MonthCalendar.jsx'
import CalendarLegend from '../components/calendar/CalendarLegend.jsx'
import DayDetailPanel from '../components/calendar/DayDetailPanel.jsx'
import { format, parseISO, eachDayOfInterval } from 'date-fns'

export default function CalendarPage() {
  const navigate = useNavigate()
  const { entries } = useCycleData()
  const { logs }    = useSymptomData()

  const [selectedDay, setSelectedDay] = useState(null)

  // Find cycle entry whose range covers the selected day
  const selectedEntry = selectedDay
    ? entries.find(e => {
        const start = parseISO(e.startDate)
        const end   = e.endDate ? parseISO(e.endDate) : start
        const d     = selectedDay
        return d >= start && d <= end
      }) ?? null
    : null

  // Find symptom log for selected day
  const selectedLog = selectedDay
    ? logs.find(l => l.date.slice(0, 10) === format(selectedDay, 'yyyy-MM-dd')) ?? null
    : null

  // Predicted dates — the range from the prediction engine
  const result = usePrediction(entries)
  const predictedDates = useMemo(() => {
    const { predictedStartDate, rangeEarlyDate, rangeLateDate, averagePeriodDuration } = result
    if (!predictedStartDate) return []
    // Mark the full predicted period window (early → late + avg duration)
    const windowStart = rangeEarlyDate ?? predictedStartDate
    const windowEnd   = rangeLateDate
      ? new Date(rangeLateDate.getTime() + (averagePeriodDuration ?? 5) * 86400000)
      : new Date(predictedStartDate.getTime() + (averagePeriodDuration ?? 5) * 86400000)
    return eachDayOfInterval({ start: windowStart, end: windowEnd })
  }, [result])

  // Determine if the selected day falls in predicted range (for DayDetailPanel)
  const selectedIsPredicted = selectedDay
    ? predictedDates.some(d => format(d, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd'))
    : false

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Calendar</h1>

      <div className="card">
        <MonthCalendar
          cycleEntries={entries}
          symptomLogs={logs}
          predictedDates={predictedDates}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
        <CalendarLegend />
      </div>

      {/* Day detail panel */}
      {selectedDay && (
        <DayDetailPanel
          date={selectedDay}
          cycleEntry={selectedEntry}
          symptomLog={selectedLog}
          isPredicted={selectedIsPredicted}
          onClose={() => setSelectedDay(null)}
          onLogSymptoms={(dateISO) => navigate(`/log?date=${dateISO}`)}
        />
      )}
    </div>
  )
}
