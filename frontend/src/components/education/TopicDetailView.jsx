/**
 * TopicDetailView — full content view for a selected health topic.
 *
 * Props:
 *   topic    HealthTopic
 *   onBack   () => void
 */
export default function TopicDetailView({ topic, onBack }) {
  // Render plain text content — preserves paragraph breaks
  const paragraphs = topic.content.split('\n\n').filter(Boolean)

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-brand-purple hover:underline flex items-center gap-1"
      >
        ← Back to topics
      </button>

      <div className="card space-y-4">
        <div>
          <span className="text-xs font-medium text-brand-purple uppercase tracking-wide">
            {topic.category}
          </span>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">{topic.title}</h2>
        </div>

        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {/* Source attribution */}
        <div className="border-t border-gray-100 dark:border-white/10 pt-3 text-xs text-brand-muted dark:text-brand-muted-dark">
          <span className="font-medium">Source: </span>
          <a
            href={topic.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-purple hover:underline"
          >
            {topic.sourceTitle}
          </a>
          {' '}— {topic.sourceOrg}
        </div>

        <p className="text-xs text-brand-muted dark:text-brand-muted-dark italic">
          This content is for general educational purposes only and does not constitute medical advice.
        </p>
      </div>
    </div>
  )
}
