/**
 * ChatMessage — a single message bubble in the chat.
 *
 * Props:
 *   role     'user' | 'assistant'
 *   content  string
 *   sources  Array<{ title, url }>   (assistant only)
 */
export default function ChatMessage({ role, content, sources = [] }) {
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={[
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
        isUser
          ? 'bg-brand-pink text-white rounded-br-sm'
          : 'bg-white dark:bg-brand-card-dark border border-gray-100 dark:border-white/10 text-gray-800 dark:text-gray-100 rounded-bl-sm',
      ].join(' ')}>
        <p className="leading-relaxed whitespace-pre-wrap">{content}</p>

        {/* Source citations — assistant only */}
        {!isUser && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/10 space-y-1">
            <p className="text-xs text-brand-muted dark:text-brand-muted-dark font-medium">Sources:</p>
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-brand-purple hover:underline truncate"
              >
                {s.title}
              </a>
            ))}
          </div>
        )}

        {/* Medical disclaimer — assistant messages only */}
        {!isUser && (
          <p className="mt-2 text-xs opacity-60 italic">
            General educational information only — not medical advice.
          </p>
        )}
      </div>
    </div>
  )
}
