from src.shared.gemini_client import ask


def plan_node(state):

    prompt = f"""
You are a migration architect.

Source analysis:

{state["analysis"]}

Target Framework:

FastAPI

Create a migration plan.

Include:

1. Files to create
2. Routes
3. Dependencies
4. Best practices

Return markdown.
"""

    plan = ask(prompt)

    print("\n========== PLAN ==========")
    print(plan)

    return {
        "plan": plan
    }