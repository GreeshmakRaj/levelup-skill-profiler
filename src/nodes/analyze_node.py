from src.shared.gemini_client import ask


def analyze_node(state):

    prompt = f"""
You are a senior software architect.

Analyze the following source code.

Identify:

1. Language
2. Framework
3. APIs
4. Libraries
5. Architecture

Return concise analysis.

Code:

{state["source_code"]}
"""

    analysis = ask(prompt)

    print("\n========== ANALYSIS ==========")
    print(analysis)

    return {
        "analysis": analysis
    }