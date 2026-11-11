/**
 * CycleLengthChart — bar chart of last 12 cycle lengths using Recharts.
 *
 * Props:
 *   cycleEntries  CycleEntry[]
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { differenceInCalendarDays, parseISO, format } from 'date-fns'

export default function CycleLengthChart({ cycleEntries }) {
  // Sort ascending, compute lengths between consecutive starts
  const sorted = [...cycleEntries]
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  const data = []
  for (let i = 1; i < sorted.length; i++) {
    const len = differenceInCalendarDays(
      parseISO(sorted[i].startDate),
      parseISO(sorted[i - 1].startDate)
    )
    if (len > 0) {
      data.push({
        label: format(parseISO(sorted[i].startDate), 'MMM d'),
        days:  len,
      })
    }
  }

  const recent = data.slice(-12)

  if (recent.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-brand-muted dark:text-brand-muted-dark text-sm">
        Log 2+ periods to see cycle lengths
      </div>
    )
  }

  const avg = Math.round(recent.reduce((s, d) => s + d.days, 0) / recent.length)

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={recent} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 3', 'dataMax + 3']}
          />
          <Tooltip
            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v) => [`${v} days`, 'Cycle length']}
          />
          <ReferenceLine
            y={avg}
            stroke="#b983d4"
            strokeDasharray="4 2"
            label={{ value: `avg ${avg}d`, position: 'insideTopRight', fontSize: 11, fill: '#b983d4' }}
          />
          <Bar dataKey="days" fill="#f8a4c8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark text-center mt-1">
        Last {recent.length} cycle{recent.length !== 1 ? 's' : ''} · dashed line = average
      </p>
    </div>
  )
}
