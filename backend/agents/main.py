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
        "question": "Can the company see my period dates?",
        "expected_route": "Agent 2 (Policy Agent)",
    },
    {
        "question": "What is ovulation?",
        "expected_route": "Agent 3 (Health Agent)",
    },
    {
        "question": "Is my data safe if I lose my phone, and why do I get cramps?",
        "expected_route": "Both agents (split question)",
    },
    {
        "question": "What's the weather today?",
        "expected_route": "Declined by Supervisor (off-topic)",
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
    print("  All 4 test questions completed.")
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
