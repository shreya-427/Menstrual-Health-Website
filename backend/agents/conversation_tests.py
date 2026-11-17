"""
conversation_tests.py — Runs all 9 multi-turn conversation tests.

Usage (from backend/agents/):
    py -3.10 -X utf8 conversation_tests.py
"""
import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from openai import OpenAI
from supervisor_agent import ask_supervisor

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

SEP = "=" * 70
SUB = "-" * 70

def clean(text):
    """Strip hidden routing tags before displaying."""
    return re.sub(r"<!--\s*route:\w+\s*-->", "", text).strip()

def run_conversation(label, turns):
    """
    turns: list of (speaker, text) where speaker is "USER" or "EXPECTED".
    USER turns are sent to the supervisor; EXPECTED turns describe what we expect.
    """
    print(f"\n{SEP}")
    print(f"  CONVERSATION: {label}")
    print(SEP)
    history = []
    last_answer = None

    for speaker, text in turns:
        if speaker == "EXPECTED":
            print(f"  [Expected]: {text}")
            continue
        if speaker != "USER":
            continue

        print(f"\n  USER: {text}")
        answer = ask_supervisor(text, client, history=history)
        clean_answer = clean(answer)
        # Update history (store with routing tag for _last_agent detection,
        # but display clean)
        history.append({"role": "user", "content": text})
        history.append({"role": "assistant", "content": answer})
        last_answer = clean_answer

        print(f"  ASSISTANT:")
        for line in clean_answer.splitlines():
            if line.strip():
                print(f"    {line}")
            else:
                print()
    print()


TESTS = [
    (
        "1. What is ovulation? then can you dumb this down",
        [
            ("USER",     "What is ovulation?"),
            ("USER",     "can you dumb this down"),
            ("EXPECTED", "simpler version of ovulation answer, no error"),
        ],
    ),
    (
        "2. Can the company see my period dates? then explain that more simply",
        [
            ("USER",     "Can the company see my period dates?"),
            ("USER",     "explain that more simply"),
            ("EXPECTED", "simpler version from Policy Agent"),
        ],
    ),
    (
        "3. What are the symptoms of endometriosis? then shorter please",
        [
            ("USER",     "What are the symptoms of endometriosis?"),
            ("USER",     "shorter please"),
            ("EXPECTED", "shorter version, no diagnosis, still redirects to provider"),
        ],
    ),
    (
        "4. What is PCOS? then why?",
        [
            ("USER",     "What is PCOS?"),
            ("USER",     "why?"),
            ("EXPECTED", "follow-up handled, not an error"),
        ],
    ),
    (
        "5. can you dumb this down as FIRST message (no prior context)",
        [
            ("USER",     "can you dumb this down"),
            ("EXPECTED", "friendly clarifying reply, not an error"),
        ],
    ),
    (
        "6. hhdhdhdh (gibberish)",
        [
            ("USER",     "hhdhdhdh"),
            ("EXPECTED", "says it is outside what it can help with"),
        ],
    ),
    (
        "7. thanks!",
        [
            ("USER",     "thanks!"),
            ("EXPECTED", "short polite reply, no agent called"),
        ],
    ),
    (
        "8. Policy Q then Health Q then follow-up",
        [
            ("USER",     "Can the company see my period dates?"),
            ("USER",     "What is PCOS?"),
            ("USER",     "can you explain that more simply"),
            ("EXPECTED", "follow-up goes to health agent (last answer was health)"),
        ],
    ),
    (
        "9. Do I have PCOS? then can you dumb this down",
        [
            ("USER",     "Do I have PCOS?"),
            ("USER",     "can you dumb this down"),
            ("EXPECTED", "simplified reply still redirects to provider, no diagnosis"),
        ],
    ),
]

if __name__ == "__main__":
    print(f"\n{SEP}")
    print("  9-CONVERSATION TEST SUITE")
    print(SEP)
    for label, turns in TESTS:
        run_conversation(label, turns)
    print(f"\n{SEP}")
    print("  All conversations completed.")
    print(SEP)
