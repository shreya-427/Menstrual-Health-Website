/**
 * aiService.js — AI chat service module.
 *
 * REQUEST FORMAT (what the frontend sends):
 *   POST /api/ask
 *   Content-Type: application/json
 *   {
 *     "question": string,                          — the new user message (max 500 chars)
 *     "history":  [{ "role": "user"|"assistant", "content": string }, ...]
 *                                                  — recent prior turns (last 6 messages)
 *   }
 *
 * RESPONSE FORMAT (what the backend must return):
 *   Success HTTP 200:
 *   { "answer": string, "sources": [{ "title": string, "url": string }] }
 *
 *   Error HTTP 4xx/5xx:
 *   The frontend maps status codes to friendly messages.
 */

const MAX_QUESTION_LENGTH = 500
const MAX_HISTORY_TURNS = 6   // number of prior messages to include (keeps payload small)

/**
 * askQuestion(question, history) → Promise<{ answer, sources }>
 *
 * history is an array of { role, content } objects from the conversation so far.
 * The greeting message (role=assistant, synthetic) is excluded from history sent to backend.
 *
 * Throws an Error on network failure or non-2xx response.
 */
export async function askQuestion(question, history = []) {
  const trimmed = question.trim()

  if (!trimmed) {
    throw new Error('Question cannot be empty.')
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question is too long (max ${MAX_QUESTION_LENGTH} characters).`)
  }

  // Send only the last N messages as history (excludes the current question itself)
  const recentHistory = history.slice(-MAX_HISTORY_TURNS)

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: trimmed, history: recentHistory }),
    }
  )
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}
