/**
 * TopicCard — a single health topic card in the browse list.
 *
 * Props:
 *   topic     HealthTopic
 *   onClick   () => void
 */
export default function TopicCard({ topic, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-white/10
                 bg-white dark:bg-brand-card-dark hover:border-brand-pink/40
                 hover:shadow-sm transition-all duration-150 space-y-1"
    >
      <span className="text-xs font-medium text-brand-purple uppercase tracking-wide">
        {topic.category}
      </span>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{topic.title}</p>
      <p className="text-xs text-brand-muted dark:text-brand-muted-dark line-clamp-2">{topic.summary}</p>
    </button>
  )
}
