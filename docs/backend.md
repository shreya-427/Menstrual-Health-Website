# Backend

The backend is a Python/FastAPI application that acts as a credential proxy between the React frontend and the Ollama LLM runtime. It receives questions from the browser, routes them through a three-agent pipeline, and returns answers.

**Directory:** `backend/`

---

## Overview

```
browser
   │  POST /api/ask  { question, history[] }
   ▼
backend/server.py          ← FastAPI HTTP bridge (rate limiting, CORS, retries)
   │
   ▼
backend/agents/supervisor_agent.py   ← routes to correct sub-agent(s)
   ├─► backend/agents/health_agent.py     ← menstrual health questions
   └─► backend/agents/policy_agent.py     ← privacy / data-policy questions
```

The backend uses **Ollama** running locally with the `llama3.2` model. The OpenAI Python SDK is used as the client because Ollama exposes an OpenAI-compatible API.

---

## Running the Backend

### Prerequisites

- Python 3.10 or later
- [Ollama](https://ollama.com) installed and running locally with the `llama3.2` model:
  ```powershell
  ollama pull llama3.2
  ollama serve          # starts at http://localhost:11434
  ```

### Install and start

```powershell
cd backend
pip install -r requirements.txt
py -3.10 -m uvicorn server:app --port 8000 --reload
```

The server starts at `http://localhost:8000`. It logs each request to the console (method, endpoint, status, timestamp — no question content in production logs).

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_BASE_URL` | `http://localhost:11434/v1` | Ollama API base URL |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed CORS origins |

Set these in a `.env` file in the `backend/` directory or as shell environment variables.

---

## `server.py` — HTTP Bridge

**File:** `backend/server.py`

The server handles all HTTP concerns. The agent code in `backend/agents/` does not deal with HTTP at all.

### Endpoints

#### `POST /api/ask`

Receives a question and optional conversation history. Returns an answer from the agent pipeline.

**Request body:**
```json
{
  "question": "string",
  "history": [
    { "role": "user",      "content": "string" },
    { "role": "assistant", "content": "string" }
  ]
}
```

- `question` — required; must be non-empty and no longer than 500 characters (matches the frontend limit).
- `history` — optional array of past turns for multi-turn conversation support. The server accepts at most the last 10 messages; older history is silently dropped.

**Response (HTTP 200):**
```json
{
  "answer": "string",
  "sources": []
}
```

`sources` is always an empty array in the current implementation. The field exists to match the shape the frontend expects so the connection can be made without further changes.

**Error responses:**

| Status | Condition | Frontend message |
|---|---|---|
| 400 | `question` is empty or exceeds 500 characters | "Your question could not be processed. Please rephrase and try again." |
| 429 | Rate limit exceeded (20 requests per IP per 60 seconds) | "Too many requests. Please wait a moment before asking another question." |
| 503 | Ollama is unreachable after 2 attempts | "The assistant is temporarily unavailable. Please try again later." |
| 500 | Unexpected error after 2 attempts | "The assistant is temporarily unavailable. Please try again later." |

#### `GET /api/health`

Health check endpoint. Returns `{"status": "ok"}` if the server is running.

### Rate limiting

The server tracks request timestamps per client IP address in memory. The limit is 20 requests per 60-second sliding window. This resets when the server restarts (it is not persisted).

### Retry logic

For unexpected errors (not rate-limit or bad input), the server automatically retries the agent call once after a 0.5-second pause. If both attempts fail, it returns a 500 or 503 as appropriate.

### CORS

Only origins listed in `ALLOWED_ORIGINS` are permitted. In development this defaults to both `localhost:5173` variants. In production, set `ALLOWED_ORIGINS` to your deployed frontend URL.

### Logging

Logs are written to stdout in the format `TIMESTAMP [LEVEL] message`. The server logs:
- Every question received: IP address, history length, and the first 80 characters of the question.
- Every answer sent: IP address, attempt number, and answer length.
- All errors with full tracebacks.

**The full content of questions is not logged** — only the first 80 characters in the request log line.

---

## Three-Agent Pipeline

### Agent 1 — Supervisor (`supervisor_agent.py`)

**Entry point:** `ask_supervisor(question, client, history=[])`

The supervisor handles every incoming question. It never answers health or policy questions itself — it classifies the question and delegates to the appropriate sub-agent(s).

**Classification routes:**

| Route | Condition | Action |
|---|---|---|
| `health` | Medical/physiological question | Calls `ask_health_agent` |
| `policy` | Privacy/data-handling question | Calls `ask_policy_agent` |
| `both` | Question touches health AND policy | Calls both agents in parallel (via `ThreadPoolExecutor`), combines answers |
| `greeting` | "hi", "thanks", etc. | Answers inline; no sub-agent called |
| `off_topic` | Outside the app's scope | Politely declines inline |

**Follow-up detection:** If the user sends a follow-up request ("dumb this down", "explain more simply", "shorter please", "why?", etc.) the supervisor detects it and routes to the same agent that answered the previous turn. It uses the conversation history to determine which agent answered last. If a follow-up arrives as the very first message (no history), the supervisor returns a friendly clarifying reply instead of an error.

**In-process response cache:** Exact repeat questions (case-insensitive, trimmed) return the cached answer immediately without calling the LLM. The cache holds up to 200 entries (oldest evicted first). Follow-up questions with different history are intentionally not cached.

---

### Agent 2 — Policy Agent (`policy_agent.py`)

**Entry point:** `ask_policy_agent(question, client, history=[])`

Answers questions about privacy, data handling, and what the app does or does not transmit. Its knowledge base covers:
- What data is stored locally vs. transmitted
- What IBM receives and retains
- Encryption status
- User rights (export, deletion)
- Security limitations

---

### Agent 3 — Health Agent (`health_agent.py`)

**Entry point:** `ask_health_agent(question, client, history=[])`

Answers general menstrual health education questions from a built-in knowledge base (~900 lines). The knowledge base covers:

- Menstrual cycle basics and phases
- Common symptoms and causes (cramps, PMS, PMDD)
- Cycle irregularities
- Conditions: PCOS, endometriosis, uterine fibroids, ovarian cysts
- Perimenopause and menopause
- Nutrition, exercise, lifestyle factors
- When to seek medical care / warning signs

**Safety guardrails:**
- Does not diagnose conditions.
- Does not recommend specific medications, doses, or treatments.
- Redirects to a healthcare provider for personal medical questions.
- Flags emergency warning signs (heavy soaking, severe pain, prolonged bleeding) and advises prompt care.
- Declines questions outside menstrual health (redirects to appropriate resources).

---

## Developer Tools

### `backend/agents/main.py` — Test harness

Runs a suite of 8 test questions against the full agent pipeline and prints results to the console.

```powershell
cd backend/agents
py -3.10 main.py                              # run 8 test questions
py -3.10 main.py --interactive                # interactive chat session
py -3.10 main.py --question "What is PCOS?"  # single question
```

**Test questions cover:**
- General health question (PCOS explanation)
- Diagnosis-seeking question (expects redirect, not diagnosis)
- Specific clinical question (irregular ovulation frequency — expects no invented numbers)
- Treatment/medication question (expects redirect to provider/pharmacist)
- Emergency warning scenario (heavy bleeding — expects urgency cue)
- General menopause information
- Policy question (data privacy)
- Out-of-scope question (expects polite decline)

Requires Ollama to be running.

---

### `backend/agents/conversation_tests.py` — Multi-turn test suite

Runs 9 multi-turn conversation scenarios to verify that follow-up routing and conversation history work correctly.

```powershell
cd backend/agents
py -3.10 -X utf8 conversation_tests.py
```

**Scenarios tested:**
1. Health question then "dumb this down" follow-up
2. Policy question then "explain more simply" follow-up
3. Health question then "shorter please" follow-up
4. Health question then bare "why?" follow-up
5. "Dumb this down" as the very first message (no prior context — expects graceful clarifying reply)
6. Gibberish input (expects polite out-of-scope response)
7. "Thanks!" greeting (expects short polite reply without calling any sub-agent)
8. Policy → Health → follow-up (follow-up routes to whichever agent answered last)
9. Diagnosis-seeking question then "dumb this down" (simplified answer still refuses diagnosis)

---

### `backend/agents/timing_test.py` — Latency measurement

Measures how long each stage of the pipeline takes for three representative question types: a health question, a policy question, and a combined "both" question.

```powershell
cd backend/agents
py -3.10 timing_test.py
```

Output shows milliseconds for supervisor routing, each agent's answer generation, and the total request time.

---

## Dependencies

**`backend/requirements.txt`** — used when running `server.py`:
```
openai>=1.30.0
fastapi>=0.110
uvicorn[standard]>=0.29
python-dotenv>=1.0
```

**`backend/agents/requirements.txt`** — used when running agent scripts directly (without the server):
```
openai>=1.30.0
```

Install from the `backend/` directory for the full server, or from `backend/agents/` when only running the developer tools.

---

## Known Issues and Limitations

| Issue | Detail |
|---|---|
| **Ollama dependency** | The backend requires Ollama running locally. It is not connected to IBM watsonx. Swapping to watsonx requires changing the `OpenAI` client base URL and API key in `server.py` and in the agent files. |
| **In-memory rate limiting** | Rate limit counters reset when the server restarts. Under high load or with multiple server processes, the limit is not enforced across processes. |
| **No question logging** | Only the first 80 characters of each question are logged. This is intentional for privacy but makes debugging harder. |
| **Sources always empty** | The `sources` field in `/api/ask` responses is always `[]`. Agents do not currently return source citations. |
| **`encryptionService.html` filename** | `frontend/src/services/encryptionService.html` has the wrong file extension — it should be `encryptionService.js`. Until it is renamed, `PassphraseGate.jsx` (which imports `'../services/encryptionService.js'`) will fail to resolve the module. Rename the file to fix this. |
