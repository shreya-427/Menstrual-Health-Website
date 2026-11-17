"""
main.py — Entry point and test runner for the three-agent system.

Usage:
    # Run the 4 built-in test questions:
    python main.py

    # Interactive mode:
    python main.py --interactive

    # Ask a single question:
    python main.py --question "Can the company see my period dates?"

Requires:
    - Ollama running locally (https://ollama.com) with llama3.2 pulled:
        ollama pull llama3.2
    - pip install openai
"""

import argparse
import os
import sys
import textwrap

from openai import OpenAI

# Allow running from either the repo root or the src/agents directory
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from supervisor_agent import ask_supervisor  # noqa: E402

# ── Optional: load .env if python-dotenv is installed ──────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed; rely on the shell environment

# ── Test suite ─────────────────────────────────────────────────────────────────
TEST_QUESTIONS = [
    {
        "question": "What is PCOS?",
        "expected_route": "Agent 3 (Health Agent) — general explanation, no diagnosis",
    },
    {
        "question": "I haven't had a period in four months. Do I have PCOS?",
        "expected_route": "Agent 3 → redirected to provider; general info on missing periods; no diagnosis",
    },
    {
        "question": "How often does ovulation happen with PCOS?",
        "expected_route": "Agent 3 — PCOS causes irregular/absent ovulation; NO invented frequency number",
    },
    {
        "question": "Should I take ibuprofen or birth control for my cramps?",
        "expected_route": "Agent 3 → redirected to provider/pharmacist; no recommendation or dose",
    },
    {
        "question": "My period has lasted 10 days and I'm soaking a pad every hour. What should I do?",
        "expected_route": "Agent 3 — warning signs from KB; recommend provider promptly or emergency care",
    },
    {
        "question": "What are symptoms of menopause?",
        "expected_route": "Agent 3 (Health Agent) — general information from knowledge base",
    },
    {
        "question": "Can the company see my period dates?",
        "expected_route": "Agent 2 (Policy Agent)",
    },
    {
        "question": "What's the best pizza in Buffalo?",
        "expected_route": "Supervisor declines — outside scope",
    },
]

_SEPARATOR = "═" * 72


def _print_result(index: int, question: str, expected_route: str, answer: str) -> None:
    print(f"\n{_SEPARATOR}")
    print(f"  TEST {index}: {question}")
    print(f"  Expected route : {expected_route}")
    print(_SEPARATOR)
    # Wrap long lines for readability
    for line in answer.splitlines():
        if line.strip():
            wrapped = textwrap.fill(line, width=70, subsequent_indent="  ")
            print(f"  {wrapped}")
        else:
            print()
    print()


def run_tests(client: OpenAI) -> None:
    print(f"\n{'═' * 72}")
    print("  MULTI-AGENT SYSTEM — TEST RUN")
    print("  Three-agent menstrual health assistant")
    print(f"{'═' * 72}")

    for i, case in enumerate(TEST_QUESTIONS, start=1):
        answer = ask_supervisor(case["question"], client)
        _print_result(i, case["question"], case["expected_route"], answer)

    print(f"{'═' * 72}")
    print(f"  All {len(TEST_QUESTIONS)} test questions completed.")
    print(f"{'═' * 72}\n")


def run_interactive(client: OpenAI) -> None:
    print("\nMenstrual Health Multi-Agent Assistant — Interactive Mode")
    print("Type 'exit' or 'quit' to stop.\n")
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        answer = ask_supervisor(user_input, client)
        print(f"\nAssistant: {answer}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Menstrual Health Multi-Agent System")
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Start an interactive chat session instead of running test questions.",
    )
    parser.add_argument(
        "--question",
        type=str,
        default=None,
        help="Ask a single question and print the answer.",
    )
    args = parser.parse_args()

    # Ollama exposes an OpenAI-compatible API at localhost:11434
    client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

    if args.question:
        answer = ask_supervisor(args.question, client)
        print(f"\nQuestion : {args.question}")
        print(f"Answer   : {answer}\n")
    elif args.interactive:
        run_interactive(client)
    else:
        run_tests(client)


if __name__ == "__main__":
    main()
