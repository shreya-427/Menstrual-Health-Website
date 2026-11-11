/**
 * StatCard — reusable stat display tile.
 *
 * Props:
 *   label     string
 *   value     string | number
 *   unit      string   (optional)
 *   accent    'pink' | 'purple' | 'teal'   (optional, default 'purple')
 */
const ACCENT = {
  pink:   'text-brand-pink-dark dark:text-brand-pink',
  purple: 'text-brand-purple',
  teal:   'text-brand-teal-dark dark:text-brand-teal',
}

export default function StatCard({ label, value, unit = '', accent = 'purple' }) {
  return (
    <div className="card text-center">
      <p className={`text-3xl font-bold ${ACCENT[accent] ?? ACCENT.purple}`}>
        {value ?? '—'}
        {unit && value != null && (
          <span className="text-sm font-normal text-brand-muted ml-1">{unit}</span>
        )}
      </p>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark mt-1">{label}</p>
    </div>
  )
}
