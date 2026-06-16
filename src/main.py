from pathlib import Path

from src.graph.migration_graph import (
    build_graph
)


def main():

    source_code = Path(
        "sample.js"
    ).read_text(
        encoding="utf-8"
    )

    graph = build_graph()

    result = graph.invoke(
        {
            "source_code": source_code,
            "analysis": "",
            "plan": "",
            "approved": False,
            "generated_code": ""
        }
    )

    print("\n========== DONE ==========")

    print(result)


if __name__ == "__main__":
    main()