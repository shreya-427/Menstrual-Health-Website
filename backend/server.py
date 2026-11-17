"""
server.py — HTTP bridge between the React frontend and the three-agent system.

Exposes POST /api/ask with the shape the frontend's aiService.js expects:
    request : {"question": "...", "history": [{"role": "user"|"assistant", "content": "..."}, ...]}
    response: {"answer": "...", "sources": [{"title": "...", "url": "..."}]}

Errors use plain HTTP status codes (400, 429, 5xx); the frontend maps them to
friendly messages.

Run:
    cd backend
    pip install -r requirements.txt
    py -3.10 -m uvicorn server:app --port 8000 --reload
"""

import logging
import os
import sys
import time
from collections import defaultdict, deque
from pathlib import Path

# The agent files import each other as flat modules (e.g. `from policy_agent import ...`),
# so the agents folder must be on sys.path.
sys.path.insert(0, str(Path(__file__).parent / "agents"))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from openai import APIConnectionError, OpenAI
from pydantic import BaseModel

from supervisor_agent import ask_supervisor  # noqa: E402

# ── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

MAX_QUESTION_LENGTH = 500   # matches the frontend's limit
MAX_HISTORY_MESSAGES = 10   # max history items accepted from client
RATE_LIMIT = 20             # requests per window, per client IP
RATE_WINDOW_SECONDS = 60

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app = FastAPI(title="Menstrual Health Assistant API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

_client = OpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")
_hits: dict[str, deque] = defaultdict(deque)


class HistoryMessage(BaseModel):
    role: str      # "user" or "assistant"
    content: str


class AskRequest(BaseModel):
    question: str
    history: list[HistoryMessage] = []


class Source(BaseModel):
    title: str
    url: str


class AskResponse(BaseModel):
    answer: str
    sources: list[Source] = []


def _check_rate_limit(ip: str) -> None:
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW_SECONDS:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many requests")
    q.append(now)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# Plain `def` so FastAPI runs the blocking LLM calls in a worker thread.
@app.post("/api/ask", response_model=AskResponse)
def ask(body: AskRequest, request: Request) -> AskResponse:
    ip = request.client.host if request.client else "unknown"
    _check_rate_limit(ip)

    question = body.question.strip()
    if not question or len(question) > MAX_QUESTION_LENGTH:
        raise HTTPException(status_code=400, detail="Invalid question length")

    # Sanitise and cap history from the client
    history = [
        {"role": m.role, "content": m.content}
        for m in body.history[:MAX_HISTORY_MESSAGES]
        if m.role in ("user", "assistant") and m.content.strip()
    ]

    log.info("Q [%s] history=%d turns: %r", ip, len(history), question[:80])

    # One automatic retry on unexpected exceptions (not on rate-limit or bad input).
    for attempt in (1, 2):
        try:
            answer = ask_supervisor(question, _client, history=history)
            log.info("A [%s] attempt=%d len=%d", ip, attempt, len(answer))
            return AskResponse(answer=answer, sources=[])
        except APIConnectionError as exc:
            log.error("Ollama unreachable (attempt %d): %s", attempt, exc)
            if attempt == 2:
                raise HTTPException(status_code=503, detail="Model server unavailable")
        except Exception as exc:
            log.exception("ask_supervisor failed (attempt %d): %s", attempt, exc)
            if attempt == 2:
                raise HTTPException(status_code=500, detail="Internal error")
        # Short pause before retry
        time.sleep(0.5)
