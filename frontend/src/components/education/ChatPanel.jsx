/**
 * ChatPanel — full AI chat interface.
 * Calls aiService.askQuestion(). Displays messages, loading state, and errors.
 * The disclaimer is always visible above the input.
 */
import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../../services/aiService.js'
import ChatMessage from './ChatMessage.jsx'
import ChatDisclaimer from './ChatDisclaimer.jsx'

const ERROR_MESSAGES = {
  400: 'Your question could not be processed. Please rephrase and try again.',
  429: 'Too many requests. Please wait a moment before asking another question.',
  500: 'The assistant is temporarily unavailable. Please try again later.',
  503: 'The assistant is temporarily unavailable. Please try again later.',
  network: 'Could not reach the assistant. Check your connection and try again.',
  default: 'Something went wrong. Please try again.',
}

function friendlyError(err) {
  const msg = err?.message ?? ''
  const match = msg.match(/HTTP (\d+)/)
  if (match) return ERROR_MESSAGES[match[1]] ?? ERROR_MESSAGES.default
  if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
    return ERROR_MESSAGES.network
  }
  return ERROR_MESSAGES.default
}

const SUGGESTED_QUESTIONS = [
  'What is a normal cycle length?',
  'What causes menstrual cramps?',
  'What is PCOS?',
  'Can the company see my period dates?',
  'When should I see a doctor about my period?',
]

const GREETING = {
  role: 'assistant',
  content: `Hi! I can help with two things:

**Menstrual health education** — general questions about cycles, periods, ovulation, PMS, PCOS, endometriosis, menopause, and more.

**App privacy & data policy** — questions about how this app stores and protects your data.

Please note: I provide general educational information only and cannot give medical advice. For questions about your own health, symptoms, or treatment, please talk to a healthcare provider.

What would you like to know?`,
  sources: [],
}

export default function ChatPanel() {
  const [messages, setMessages] = useState([GREETING])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const bottomRef        = useRef(null)
  const _pendingHistory  = useRef([])   // history snapshot captured just before each send

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const question = text.trim()
    if (!question || loading) return

    setError('')
    setInput('')

    // Snapshot history BEFORE adding the new user message.
    // Exclude the synthetic greeting (it is not a real server turn).
    // Only send role+content — strip the sources field the backend doesn't need.
    setMessages(prev => {
      const historySnapshot = prev
        .filter(m => m !== GREETING)
        .map(({ role, content }) => ({ role, content }))

      // Fire the API call inside the state updater so historySnapshot is current.
      // We use a ref-free approach: capture it here and call async outside.
      _pendingHistory.current = historySnapshot
      return [...prev, { role: 'user', content: question, sources: [] }]
    })

    setLoading(true)

    try {
      const response = await askQuestion(question, _pendingHistory.current)
      // Strip hidden routing tags the supervisor embeds for follow-up detection
      const cleanAnswer = response.answer.replace(/<!--\s*route:\w+\s*-->/g, '').trim()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanAnswer,
        sources: response.sources ?? [],
      }])
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Disclaimer — always visible, non-dismissable */}
      <ChatDisclaimer />

      {/* Suggested questions — shown only when only the greeting is showing */}
      {messages.length === 1 && messages[0] === GREETING && (
        <div className="space-y-2">
          <p className="text-xs text-brand-muted dark:text-brand-muted-dark font-medium">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-xl border border-brand-purple/30
                           text-brand-purple hover:bg-brand-purple/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message list */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} sources={msg.sources} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-brand-card-dark border border-gray-100 dark:border-white/10
                              rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-brand-muted dark:text-brand-muted-dark">
                <span className="animate-pulse">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-red-500 dark:text-red-400 px-1">{error}</p>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about menstrual health or how we protect your data…"
          maxLength={500}
          disabled={loading}
          aria-label="Type your question"
          className="flex-1 rounded-xl border border-gray-200 dark:border-white/10
                     bg-white dark:bg-white/5 px-3 py-2 text-sm
                     text-gray-800 dark:text-gray-100 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-brand-pink
                     disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-primary text-sm px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <p className="text-xs text-brand-muted dark:text-brand-muted-dark">
        This assistant answers general questions only. It does not provide medical diagnoses.
        Consult a qualified healthcare provider for personal medical concerns.
      </p>
    </div>
  )
}
