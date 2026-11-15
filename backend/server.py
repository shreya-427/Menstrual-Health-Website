"""
server.py — HTTP bridge between the React frontend and the three-agent system.

Exposes POST /api/ask with the exact shape the frontend's aiService.js expects:
    request : {"question": "..."}
    response: {"answer": "...", "sources": [{"title": "...", "url": "..."}]}

Errors use plain HTTP status codes (400, 429, 5xx); the frontend maps them to
friendly messages.

Run:
    cd backend
    pip install -r requirements.txt
    uvicorn server:app --port 8000 --reload
"""

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

MAX_QUESTION_LENGTH = 500  # matches the frontend's limit
RATE_LIMIT = 20            # requests per window, per client IP
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


class AskRequest(BaseModel):
    question: str


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
    _check_rate_limit(request.client.host if request.client else "unknown")

    question = body.question.strip()
    if not question or len(question) > MAX_QUESTION_LENGTH:
        raise HTTPException(status_code=400, detail="Invalid question length")

    try:
        answer = ask_supervisor(question, _client)
    except APIConnectionError:
        # Ollama isn't running / unreachable
        raise HTTPException(status_code=503, detail="Model server unavailable")
    except Exception:
        # Don't leak internals (or the user's question) in the error body.
        raise HTTPException(status_code=500, detail="Internal error")

    # The agents return plain text only; sources are an empty array for now.
    return AskResponse(answer=answer, sources=[])
