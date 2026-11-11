/**
 * SymptomFreqChart — horizontal bar chart of symptom occurrence frequency.
 *
 * Props:
 *   symptomLogs  SymptomLog[]
 */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts'

const SYMPTOM_KEYS = [
  { key: 'headache',         label: 'Headache' },
  { key: 'bloating',         label: 'Bloating' },
  { key: 'crampSeverity',    label: 'Cramps (any)' },
  { key: 'lowMood',          label: 'Low mood (≤2)' },
  { key: 'lowEnergy',        label: 'Low energy (≤2)' },
  { key: 'heavyFlow',        label: 'Heavy flow (≥4)' },
]

export default function SymptomFreqChart({ symptomLogs }) {
  if (symptomLogs.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-brand-muted dark:text-brand-muted-dark text-sm">
        Log symptoms to see frequency data
      </div>
    )
  }

  const counts = {
    headache:     symptomLogs.filter(l => l.headache).length,
    bloating:     symptomLogs.filter(l => l.bloating).length,
    crampSeverity: symptomLogs.filter(l => l.crampSeverity != null && l.crampSeverity > 0).length,
    lowMood:      symptomLogs.filter(l => l.mood != null && l.mood <= 2).length,
    lowEnergy:    symptomLogs.filter(l => l.energyLevel != null && l.energyLevel <= 2).length,
    heavyFlow:    symptomLogs.filter(l => l.flowIntensity != null && l.flowIntensity >= 4).length,
  }

  const data = SYMPTOM_KEYS
    .map(({ key, label }) => ({ label, count: counts[key] ?? 0 }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)

  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 text-brand-muted dark:text-brand-muted-dark text-sm">
        No symptoms recorded yet
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 34)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 80, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={78}
          />
          <Tooltip
            contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb', fontSize: 12 }}
            formatter={(v) => [`${v} log${v !== 1 ? 's' : ''}`, 'Occurrences']}
          />
          <Bar dataKey="count" fill="#b983d4" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark text-center mt-1">
        Based on {symptomLogs.length} symptom log{symptomLogs.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
