/**
 * ChatMessage — a single message bubble in the chat.
 *
 * Props:
 *   role     'user' | 'assistant'
 *   content  string
 *   sources  Array<{ title, url }>   (assistant only)
 *
 * Assistant messages are rendered through react-markdown so that bold text,
 * numbered lists, bullet lists, and line breaks display correctly instead of
 * showing raw markdown symbols. react-markdown does not use dangerouslySetInnerHTML
 * and never executes raw HTML, so no sanitization library is needed.
 */
import ReactMarkdown from 'react-markdown'

/** Custom renderers that apply Tailwind classes to markdown elements */
const markdownComponents = {
  // Paragraphs — standard spacing
  p: ({ children }) => (
    <p className="leading-relaxed mb-1 last:mb-0">{children}</p>
  ),
  // Bold
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  // Ordered list (1. 2. 3.)
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-4 space-y-0.5 my-1">{children}</ol>
  ),
  // Unordered list (• - *)
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-4 space-y-0.5 my-1">{children}</ul>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  // Headings — downsize so they fit chat bubbles
  h1: ({ children }) => <p className="font-bold mt-1">{children}</p>,
  h2: ({ children }) => <p className="font-bold mt-1">{children}</p>,
  h3: ({ children }) => <p className="font-semibold mt-1">{children}</p>,
  // Inline code — style without executing
  code: ({ children }) => (
    <code className="bg-black/10 dark:bg-white/10 rounded px-1 font-mono text-xs">{children}</code>
  ),
  // Block-level code
  pre: ({ children }) => (
    <pre className="bg-black/10 dark:bg-white/10 rounded p-2 text-xs overflow-x-auto my-1">{children}</pre>
  ),
}

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

        {isUser ? (
          /* User messages: plain text, no markdown processing */
          <p className="leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          /* Assistant messages: render markdown safely */
          <div className="prose-sm prose-neutral dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {content}
            </ReactMarkdown>
          </div>
        )}

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
