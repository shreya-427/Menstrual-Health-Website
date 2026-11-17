"""
timing_test.py — Measures latency at each stage of the multi-agent pipeline.

Usage (from backend/agents/ directory):
    py -3.10 timing_test.py
"""
import sys
import os
import time

_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from openai import OpenAI
from supervisor_agent import _classify, ask_supervisor
from health_agent import ask_health_agent
from policy_agent import ask_policy_agent

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

TEST_CASES = [
    ("health",  "What is PCOS?"),
    ("policy",  "Can the company see my period dates?"),
    ("both",    "Is my data safe if I lose my phone, and why do I get cramps?"),
]

SEP = "-" * 68

def time_question(label, question):
    print(f"\n{SEP}")
    print(f"  [{label.upper()}] {question}")
    print(SEP)

    total_start = time.perf_counter()

    # 1 — Supervisor routing
    t0 = time.perf_counter()
    classification = _classify(question, client)
    route_ms = (time.perf_counter() - t0) * 1000
    route = classification.get("route", "?")
    print(f"  Supervisor routing:   {route_ms:7.0f} ms  -> route={route}")

    # 2 — Agent answer generation (re-use routing result)
    t0 = time.perf_counter()
    if route == "policy":
        q = classification.get("policy_question") or question
        answer = ask_policy_agent(q, client)
    elif route == "health":
        q = classification.get("health_question") or question
        answer = ask_health_agent(q, client)
    elif route == "both":
        # Sequential for baseline measurement
        pq = classification.get("policy_question") or question
        hq = classification.get("health_question") or question
        t_p = time.perf_counter()
        pa = ask_policy_agent(pq, client)
        policy_ms = (time.perf_counter() - t_p) * 1000
        t_h = time.perf_counter()
        ha = ask_health_agent(hq, client)
        health_ms = (time.perf_counter() - t_h) * 1000
        answer = pa + "\n\n---\n\n" + ha
        agent_ms = (time.perf_counter() - t0) * 1000
        print(f"  Policy agent:         {policy_ms:7.0f} ms")
        print(f"  Health agent:         {health_ms:7.0f} ms")
        print(f"  Agents total (seq):   {agent_ms:7.0f} ms")
        total_ms = (time.perf_counter() - total_start) * 1000
        print(f"  TOTAL:                {total_ms:7.0f} ms")
        print(f"  Answer preview: {answer[:120].replace(chr(10),' ')}…")
        return
    else:
        answer = "off-topic"

    agent_ms = (time.perf_counter() - t0) * 1000
    total_ms = (time.perf_counter() - total_start) * 1000
    print(f"  Agent generation:     {agent_ms:7.0f} ms")
    print(f"  TOTAL:                {total_ms:7.0f} ms")
    print(f"  Answer preview: {answer[:120].replace(chr(10),' ')}…")

if __name__ == "__main__":
    print("\n" + "=" * 68)
    print("  BASELINE TIMING TEST")
    print("=" * 68)
    for label, q in TEST_CASES:
        time_question(label, q)
    print(f"\n{SEP}\n  Done.\n{SEP}\n")
