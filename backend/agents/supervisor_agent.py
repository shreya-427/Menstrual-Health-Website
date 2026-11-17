"""
Agent 1: Supervisor Agent (Router)
Receives every user question plus conversation history, classifies the message,
routes to Agent 2 (Policy Agent) and/or Agent 3 (Health Agent), and returns the
final answer.

Key behaviours:
- Passes full conversation history to sub-agents so follow-ups work correctly.
- Detects follow-up requests ("dumb this down", "explain more simply", etc.) and
  routes them to the same agent that answered last, with history.
- Handles greetings and thanks inline without calling any sub-agent.
- Handles "first message is a follow-up" with a friendly clarifying reply.
- Parallel calls for "both" route. In-process response cache for exact repeats.
- Logs the real exception before rethrowing so server.py can log it too.
"""

import json
import logging
import re
import hashlib
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI

log = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434/v1"
OLLAMA_MODEL = "llama3.2"

from policy_agent import ask_policy_agent
from health_agent import ask_health_agent

# ── In-process response cache ────────────────────────────────────────────────────
# Keyed on (question_lower, last_agent_that_answered).
# Follow-ups with different history are intentionally NOT cached.
_cache: dict[str, str] = {}
_CACHE_MAX = 200

def _cache_key(question: str) -> str:
    return hashlib.md5(question.strip().lower().encode()).hexdigest()

def _cache_get(question: str) -> str | None:
    return _cache.get(_cache_key(question))

def _cache_set(question: str, answer: str) -> None:
    key = _cache_key(question)
    if len(_cache) >= _CACHE_MAX:
        oldest = next(iter(_cache))
        del _cache[oldest]
    _cache[key] = answer

# ── Follow-up phrases that mean "restate / simplify the previous answer" ─────────
_FOLLOWUP_PATTERNS = re.compile(
    r"^(can you |could you |please )?"
    r"(dumb (this|it) down|"
    r"simplif(y|ied)( (that|this|it))?|"
    r"explain (that|this|it)?( more| again| better| more simply| more clearly| differently)?( simply| clearly)?|"
    r"explain (more simply|more clearly|that again|this again)|"
    r"shorter( please| version)?|"
    r"simpler( please| version| words)?|"
    r"in simpler (words|terms|language)|"
    r"plain (english|language)|"
    r"what do you mean( by that)?|what does that mean|"
    r"elaborate( on that)?|more detail(s)?|tell me more|expand on that|"
    r"give me (a|an) example|"
    r"can you repeat( that)?|repeat that|say that again|"
    r"rephrase (that|it)|"
    r"why\??|how so|"
    r"i (don'?t|do not) (understand|follow|get (it|that))|not sure what you mean|"
    r"what does (that|this) (mean|have to do with)|"
    r"make (it|that|this) (simpler|shorter|clearer|easier)|"
    r"(too long|too complicated|confusing)|"
    r"tldr|tl;?dr)"
    r"[.!?]?$",
    re.IGNORECASE,
)

# ── Greeting/thanks patterns ──────────────────────────────────────────────────────
_GREETING_PATTERNS = re.compile(
    r"^(hi|hello|hey|good (morning|afternoon|evening)|howdy|hiya)[.!?]?$",
    re.IGNORECASE,
)
_THANKS_PATTERNS = re.compile(
    r"^(thanks|thank you|thank you so much|thanks a lot|thx|ty|cheers|"
    r"got it|perfect|great|awesome|helpful|that('?s| was) (helpful|great|good|perfect|clear))[.!?]?$",
    re.IGNORECASE,
)

# ── Routing prompt ────────────────────────────────────────────────────────────────
# Kept short to minimise routing latency. Follow-up detection happens in Python
# before this prompt is ever called, so the LLM only sees genuine topic questions.
SUPERVISOR_SYSTEM_PROMPT = """Route user questions to the correct agent. Output ONLY valid JSON.

AGENTS:
- policy_agent: privacy, data storage, data security, accounts, data deletion, third-party sharing, platform data handling
- health_agent: menstrual health, cycles, periods, symptoms, ovulation, PMS, PCOS, endometriosis, cramps, menopause, ANY medical or health question (including personal ones — route those here, the agent handles the redirect to a provider)

RULES:
1. policy question only → route=policy
2. health or medical question → route=health
3. both topics in one message → route=both (split into policy_question and health_question)
4. off-topic (neither) → route=none, polite off_topic_reply
5. genuinely ambiguous → route=clarify, one short clarifying_question

NEVER answer health or medical questions yourself. Always route them to health_agent.

OUTPUT FORMAT (always exactly this JSON, no extra text):
{"route":"policy"|"health"|"both"|"none"|"clarify","policy_question":null,"health_question":null,"clarifying_question":null,"off_topic_reply":null}

EXAMPLES:
{"route":"health","policy_question":null,"health_question":"What is PCOS?","clarifying_question":null,"off_topic_reply":null}
{"route":"policy","policy_question":"Can the company see my period dates?","health_question":null,"clarifying_question":null,"off_topic_reply":null}
{"route":"both","policy_question":"Is my data safe if I lose my phone?","health_question":"Why do I get cramps?","clarifying_question":null,"off_topic_reply":null}
{"route":"none","policy_question":null,"health_question":null,"clarifying_question":null,"off_topic_reply":"I can only help with menstrual health or platform privacy questions. That question is outside my scope."}
"""


def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a string (handles markdown code fences)."""
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found in routing response: {text!r}")
    fragment = text[start:]
    if not fragment.rstrip().endswith("}"):
        fragment = fragment.rstrip().rstrip(",") + "\n}"
    return json.loads(fragment)


def _classify(user_question: str, client: OpenAI) -> dict:
    """Call the LLM to classify and decompose the user question (no history needed)."""
    response = client.chat.completions.create(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": SUPERVISOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_question},
        ],
        temperature=0.0,
        max_tokens=120,
    )
    raw = response.choices[0].message.content.strip()
    return _extract_json(raw)


def _last_agent(history: list[dict]) -> str | None:
    """
    Scan conversation history backward to find which agent answered last.
    Returns "health", "policy", "both", or None if unknown.
    """
    # Look for the last assistant message that contains a known routing marker.
    # We embed a hidden tag in combined answers so we can detect "both".
    for msg in reversed(history):
        if msg.get("role") == "assistant":
            content = msg.get("content", "")
            if "<!-- route:both -->" in content:
                return "both"
            if "<!-- route:policy -->" in content:
                return "policy"
            if "<!-- route:health -->" in content:
                return "health"
            # Fallback heuristic when tags are absent (older messages):
            # If the answer mentions the privacy disclaimer it was policy;
            # if it mentions the medical disclaimer it was health.
            if "privacy" in content.lower() and "medical advice" not in content.lower():
                return "policy"
            if "medical advice" in content.lower() or "healthcare provider" in content.lower():
                return "health"
    return None


def _build_messages_for_agent(
    system_prompt: str,
    history: list[dict],
    current_question: str,
) -> list[dict]:
    """Build the messages array for a sub-agent call, including conversation history."""
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        role = msg.get("role", "")
        content = msg.get("content", "")
        # Strip our hidden routing tags before passing history to agents
        content = re.sub(r"<!--\s*route:\w+\s*-->", "", content).strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": current_question})
    return messages


def _format_combined(policy_answer: str, health_answer: str) -> str:
    """Merge a policy answer and a health answer into one readable reply."""
    return (
        "<!-- route:both -->"
        "I've looked into both parts of your question:\n\n"
        "**About your data & privacy:**\n\n"
        f"{policy_answer}\n\n"
        "---\n\n"
        "**About your health question:**\n\n"
        f"{health_answer}"
    )


def _ask_agent_with_history(
    agent_fn,
    system_prompt: str,
    history: list[dict],
    question: str,
    client: OpenAI,
    route_tag: str,
) -> str:
    """Call a sub-agent, passing full conversation history."""
    messages = _build_messages_for_agent(system_prompt, history, question)
    response = client.chat.completions.create(
        model=OLLAMA_MODEL,
        messages=messages,
        temperature=0.3,
    )
    answer = response.choices[0].message.content.strip()
    return f"<!-- route:{route_tag} -->{answer}"


def ask_supervisor(
    user_question: str,
    client: OpenAI,
    history: list[dict] | None = None,
) -> str:
    """
    Main entry point for the multi-agent system.

    Parameters
    ----------
    user_question : str   The new message from the user.
    client        : OpenAI  The LLM client.
    history       : list[dict]  Prior conversation turns as [{"role":..., "content":...}].
                    Does NOT include the current user_question itself.
    """
    if history is None:
        history = []

    q = user_question.strip()

    # ── Greeting ──────────────────────────────────────────────────────────────────
    if _GREETING_PATTERNS.match(q):
        return (
            "Hi! I can help with general menstrual health education and with "
            "questions about how this app handles your data. What would you like to know?"
        )

    # ── Thanks / acknowledgement ──────────────────────────────────────────────────
    if _THANKS_PATTERNS.match(q):
        return "You're welcome! Let me know if you have any other questions."

    # ── Follow-up detection ───────────────────────────────────────────────────────
    if _FOLLOWUP_PATTERNS.match(q):
        last = _last_agent(history)
        if last is None:
            # Follow-up with no prior context — ask a clarifying question
            return (
                "I'm happy to help! Could you tell me what you'd like me to explain? "
                "I can help with menstrual health topics and with our privacy and data policy."
            )
        # Route the follow-up to the same agent that answered last, with history
        simplify_prompt = (
            f"The user wants a simpler explanation. Their request: \"{q}\"\n\n"
            "Please rewrite your previous answer in plain language at about a middle-school "
            "reading level. Use short sentences. Keep all the key facts, all safety "
            "information, and all guidance to see a healthcare provider. Do not add new "
            "information and do not remove any safety rules or warnings."
        )
        if last == "policy":
            from policy_agent import POLICY_SYSTEM_PROMPT
            answer = _ask_agent_with_history(
                ask_policy_agent, POLICY_SYSTEM_PROMPT, history, simplify_prompt, client, "policy"
            )
            return answer
        elif last == "health":
            from health_agent import HEALTH_SYSTEM_PROMPT
            answer = _ask_agent_with_history(
                ask_health_agent, HEALTH_SYSTEM_PROMPT, history, simplify_prompt, client, "health"
            )
            return answer
        else:  # "both" — simplify the last answer, ask health agent since it's longer
            from health_agent import HEALTH_SYSTEM_PROMPT
            answer = _ask_agent_with_history(
                ask_health_agent, HEALTH_SYSTEM_PROMPT, history, simplify_prompt, client, "health"
            )
            return answer

    # ── Cache check (only for standalone questions without history) ───────────────
    if not history and len(q) > 5:
        cached = _cache_get(q)
        if cached is not None:
            return cached

    # ── Classify the question ─────────────────────────────────────────────────────
    classification = _classify(q, client)
    route = classification.get("route", "none")
    answer: str

    if route == "policy":
        pq = classification.get("policy_question") or q
        from policy_agent import POLICY_SYSTEM_PROMPT
        answer = _ask_agent_with_history(
            ask_policy_agent, POLICY_SYSTEM_PROMPT, history, pq, client, "policy"
        )

    elif route == "health":
        hq = classification.get("health_question") or q
        from health_agent import HEALTH_SYSTEM_PROMPT
        answer = _ask_agent_with_history(
            ask_health_agent, HEALTH_SYSTEM_PROMPT, history, hq, client, "health"
        )

    elif route == "both":
        # Run both agents IN PARALLEL with their respective history
        pq = classification.get("policy_question") or q
        hq = classification.get("health_question") or q
        from policy_agent import POLICY_SYSTEM_PROMPT
        from health_agent import HEALTH_SYSTEM_PROMPT
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_policy = executor.submit(
                _ask_agent_with_history,
                ask_policy_agent, POLICY_SYSTEM_PROMPT, history, pq, client, "policy"
            )
            future_health = executor.submit(
                _ask_agent_with_history,
                ask_health_agent, HEALTH_SYSTEM_PROMPT, history, hq, client, "health"
            )
            policy_answer = future_policy.result()
            health_answer = future_health.result()
        # Strip per-agent tags before wrapping in combined
        policy_clean = re.sub(r"<!--\s*route:\w+\s*-->", "", policy_answer).strip()
        health_clean = re.sub(r"<!--\s*route:\w+\s*-->", "", health_answer).strip()
        answer = _format_combined(policy_clean, health_clean)

    elif route == "clarify":
        cq = classification.get("clarifying_question")
        answer = (
            f"Could you help me understand your question a bit better? {cq}"
            if cq else
            "Could you clarify whether you're asking about the website's "
            "privacy/data policies, or about menstrual health in general?"
        )

    else:  # "none" or unexpected
        off_topic = classification.get("off_topic_reply")
        answer = off_topic or (
            "I'm sorry, that question is outside what I'm able to help with here. "
            "This assistant can only answer questions about menstrual health or "
            "the platform's privacy and data policies. For other questions, please "
            "contact support or consult an appropriate professional."
        )

    # Cache standalone questions (no history) only
    if route in ("policy", "health") and not history and len(q) > 5:
        _cache_set(q, answer)

    return answer
