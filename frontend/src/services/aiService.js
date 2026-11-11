/**
 * aiService.js — AI chat service module.
 *
 * ★ INTEGRATION SEAM for the AI teammate ★
 *
 * REQUEST FORMAT (what the frontend sends):
 *   POST /api/ask
 *   Content-Type: application/json
 *   { "question": string }   — max 500 chars, non-empty
 *   No stored health records are included. The user typed this text directly.
 *
 * RESPONSE FORMAT (what the backend must return):
 *   Success HTTP 200:
 *   { "answer": string, "sources": [{ "title": string, "url": string }] }
 *   sources may be an empty array.
 *
 *   Error HTTP 4xx/5xx:
 *   The frontend does not inspect the body — it shows a status-based message.
 *
 * TO CONNECT THE REAL BACKEND (AI teammate):
 *   1. Set VITE_BACKEND_URL in frontend/.env
 *      e.g.  VITE_BACKEND_URL=https://your-backend.ibmcloud.com
 *   2. Replace the mock body of askQuestion() with:
 *
 *        const res = await fetch(
 *          `${import.meta.env.VITE_BACKEND_URL}/api/ask`,
 *          {
 *            method: 'POST',
 *            headers: { 'Content-Type': 'application/json' },
 *            body: JSON.stringify({ question }),
 *          }
 *        )
 *        if (!res.ok) throw new Error(`HTTP ${res.status}`)
 *        return await res.json()
 *
 *   3. No component changes needed — the interface is fixed.
 */

const MAX_QUESTION_LENGTH = 500

/**
 * askQuestion(question) → Promise<{ answer, sources }>
 *
 * Throws an Error on network failure or non-2xx response.
 * The calling component catches the error and shows a user-friendly message.
 */
export async function askQuestion(question) {
  const trimmed = question.trim()

  if (!trimmed) {
    throw new Error('Question cannot be empty.')
  }
  if (trimmed.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question is too long (max ${MAX_QUESTION_LENGTH} characters).`)
  }

  // ── Mock implementation (active during frontend development) ────────────────
  // Simulates a 1-second network delay, then returns a canned response.
  // Replace this entire block with the fetch() call above when the backend is ready.
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    answer: `This is a placeholder response for: "${trimmed.slice(0, 60)}${trimmed.length > 60 ? '…' : ''}". ` +
      `The AI assistant will answer general menstrual health questions here once the IBM watsonx backend is connected by your teammate.`,
    sources: [
      {
        title: 'NIH Office on Women\'s Health — Menstrual Cycle',
        url: 'https://www.womenshealth.gov/menstrual-cycle',
      },
    ],
  }
  // ── End mock ─────────────────────────────────────────────────────────────────
}
