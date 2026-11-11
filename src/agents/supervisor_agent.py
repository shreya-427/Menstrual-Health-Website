"""
Agent 1: Supervisor Agent (Router)
Receives every user question, classifies it, routes to Agent 2 (Policy Agent)
and/or Agent 3 (Health Agent), and returns the final answer to the user.
Agent 2 and Agent 3 are wired in as callable tools.
"""

import json
import re
from openai import OpenAI

# Ollama runs a local OpenAI-compatible server at this base URL.
OLLAMA_BASE_URL = "http://localhost:11434/v1"
OLLAMA_MODEL = "llama3.2"

from policy_agent import ask_policy_agent
from health_agent import ask_health_agent

# ── Routing prompt ──────────────────────────────────────────────────────────────
SUPERVISOR_SYSTEM_PROMPT = """You are the Supervisor Agent for a menstrual health platform.
Your ONLY job is to classify user questions and route them to the correct specialist agent.
You do NOT answer questions yourself.

You have exactly two tools available:
  • policy_agent  — handles questions about the website's privacy, data storage, data
                    security, account access, data deletion, third-party sharing, and how
                    the platform handles user information.
  • health_agent  — handles general educational questions about menstrual health:
                    cycles, periods, symptoms, ovulation, PMS, PMDD, cramps, hygiene,
                    perimenopause, menopause, and related health topics.

ROUTING RULES:
1. POLICY questions (privacy, data storage, data security, accounts, accessing data
   from another device, deleting data, third-party sharing, how the platform handles
   user information) → use policy_agent.
2. HEALTH questions (menstrual cycles, periods, symptoms, ovulation, PMS, cramps,
   hormones, hygiene, perimenopause, menopause) → use health_agent.
3. MIXED questions (both topics in one message) → call BOTH agents and combine the
   answers into a single clear reply. Label each part clearly.
4. OFF-TOPIC or UNANSWERABLE questions (neither policy nor health) → call NO agent.
   Set route to "none" and explain politely that this question is outside scope.
5. If a question is AMBIGUOUS and could go either way, ask ONE short clarifying
   question before routing.

OUTPUT FORMAT — always respond with valid JSON only, with this exact structure:
{
  "route": "policy" | "health" | "both" | "none" | "clarify",
  "policy_question": "<the policy sub-question to send, or null>",
  "health_question": "<the health sub-question to send, or null>",
  "clarifying_question": "<the clarifying question to ask the user, or null>",
  "off_topic_reply": "<polite decline message for off-topic questions, or null>"
}

Examples:
  User: "Can the company see my period dates?"
  → {"route": "policy", "policy_question": "Can the company see my period dates?",
     "health_question": null, "clarifying_question": null, "off_topic_reply": null}

  User: "What is ovulation?"
  → {"route": "health", "policy_question": null,
     "health_question": "What is ovulation?",
     "clarifying_question": null, "off_topic_reply": null}

  User: "Is my data safe if I lose my phone, and why do I get cramps?"
  → {"route": "both",
     "policy_question": "Is my data safe if I lose my phone?",
     "health_question": "Why do I get cramps during my period?",
     "clarifying_question": null, "off_topic_reply": null}

  User: "What's the weather today?"
  → {"route": "none", "policy_question": null, "health_question": null,
     "clarifying_question": null,
     "off_topic_reply": "I'm sorry, I can only help with questions about menstrual health or the platform's privacy and data policies. For weather, please check a weather service or app. If you have a health or privacy question, I'm happy to help!"}

IMPORTANT: Output ONLY valid JSON. Do not include any text outside the JSON object.
"""


def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a string (handles markdown code fences
    and LLM responses that forget the closing brace)."""
    # Strip markdown code fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip()
    # Find the first { and take everything from there
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found in response: {text!r}")
    fragment = text[start:]
    # If the closing brace is missing, append one so json.loads can parse it
    if not fragment.rstrip().endswith("}"):
        fragment = fragment.rstrip().rstrip(",") + "\n}"
    return json.loads(fragment)


def _classify(user_question: str, client: OpenAI) -> dict:
    """Call the LLM to classify and decompose the user question."""
    response = client.chat.completions.create(
        model=OLLAMA_MODEL,
        messages=[
            {"role": "system", "content": SUPERVISOR_SYSTEM_PROMPT},
            {"role": "user", "content": user_question},
        ],
        temperature=0.0,
    )
    raw = response.choices[0].message.content.strip()
    return _extract_json(raw)


def _format_combined(policy_answer: str, health_answer: str) -> str:
    """Merge a policy answer and a health answer into one readable reply."""
    return (
        "I've looked into both parts of your question:\n\n"
        "──────────────────────────────────\n"
        "📋 About your data & privacy:\n"
        "──────────────────────────────────\n"
        f"{policy_answer}\n\n"
        "──────────────────────────────────\n"
        "🩺 About your health question:\n"
        "──────────────────────────────────\n"
        f"{health_answer}"
    )


def ask_supervisor(user_question: str, client: OpenAI) -> str:
    """
    Main entry point for the multi-agent system.
    Receives the user's question, routes it, calls the appropriate agent(s),
    and returns the final answer string.
    """
    classification = _classify(user_question, client)
    route = classification.get("route", "none")

    if route == "policy":
        q = classification.get("policy_question") or user_question
        return ask_policy_agent(q, client)

    elif route == "health":
        q = classification.get("health_question") or user_question
        return ask_health_agent(q, client)

    elif route == "both":
        policy_q = classification.get("policy_question") or user_question
        health_q = classification.get("health_question") or user_question
        policy_answer = ask_policy_agent(policy_q, client)
        health_answer = ask_health_agent(health_q, client)
        return _format_combined(policy_answer, health_answer)

    elif route == "clarify":
        cq = classification.get("clarifying_question")
        if cq:
            return f"Could you help me understand your question a bit better? {cq}"
        # Fallback if no clarifying question was provided
        return (
            "I want to make sure I route your question correctly. "
            "Could you clarify whether you're asking about the website's "
            "privacy/data policies, or about menstrual health in general?"
        )

    else:  # "none" or anything unexpected
        off_topic = classification.get("off_topic_reply")
        if off_topic:
            return off_topic
        return (
            "I'm sorry, that question is outside what I'm able to help with here. "
            "This assistant can only answer questions about menstrual health or "
            "the platform's privacy and data policies. For other questions, please "
            "contact support or consult an appropriate professional."
        )
