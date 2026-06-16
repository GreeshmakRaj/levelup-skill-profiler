from pathlib import Path

from src.shared.gemini_client import ask


def generate_node(state):

    prompt = f"""
You are an expert migration engineer.

Convert the following code into production quality FastAPI.

Requirements:

- Use FastAPI
- Add type hints
- Use APIRouter if required
- Follow Python best practices
- Return only code

Source code:

{state["source_code"]}

Migration plan:

{state["plan"]}
"""

    generated_code = ask(prompt)

    Path("output").mkdir(
        exist_ok=True
    )

    with open(
        "output/main.py",
        "w",
        encoding="utf-8"
    ) as file:

        file.write(generated_code)

    print("\n========== GENERATED ==========")
    print(generated_code)

    return {
        "generated_code": generated_code
    }