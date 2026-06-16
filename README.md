# CodeLift-AI

An intelligent code migration agent powered by LangGraph that helps automate codebase upgrades and modernization.

## Overview

CodeLift-AI is a flexible migration assistant built on LangGraph that analyzes your codebase and generates migration plans for upgrading to newer versions. It's designed to be language and framework agnostic, supporting any migration workflow you need.

## Features

- **Intelligent Analysis**: Analyzes your codebase to understand structure and current state
- **Migration Planning**: Generates detailed, customizable migration plans
- **LangGraph-Powered**: Built on LangGraph for complex, multi-step workflows
- **Flexible Architecture**: Extensible node-based system for custom migration logic
- **Agentic Workflow**: Supports analysis, planning, approval, and execution stages

## How It Works

CodeLift-AI uses a node-based workflow powered by LangGraph:

1. **Analyze**: Examines your codebase to understand its current state
2. **Plan**: Generates a detailed migration strategy based on the analysis
3. **Approve**: Presents the plan for review and approval
4. **Execute**: Applies the migration plan automatically (when approved)

## Getting Started

### Prerequisites

- Python 3.13+
- [UV](https://docs.astral.sh/uv/) (fast Python package manager)

### Installation

```bash
git clone git@github.com:GreeshmakRaj/CodeLift-AI.git
cd CodeLift-AI
uv sync
```

### Running the Agent

```bash
uv run python -m src.main
```

## Example Output

The agent generates a detailed migration plan with analysis results, recommendations, and execution steps.

## Project Structure

```
CodeLift-AI/
├── README.md
├── pyproject.toml
├── main.py                 # Entry point
└── src/
    ├── main.py
    ├── state.py           # Graph state management
    ├── graph/             # LangGraph implementation
    │   └── migration_graph.py
    ├── nodes/             # Individual workflow nodes
    │   ├── analyze_node.py
    │   ├── approval_node.py
    │   ├── generate_node.py
    │   └── plan_node.py
    └── shared/            # Shared utilities
        └── gemini_client.py
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or feedback, please open an issue on GitHub.
