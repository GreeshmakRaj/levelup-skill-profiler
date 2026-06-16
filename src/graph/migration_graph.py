from langgraph.graph import StateGraph
from langgraph.graph import END

from src.state import MigrationState

from src.nodes.analyze_node import analyze_node
from src.nodes.plan_node import plan_node
from src.nodes.approval_node import approval_node
from src.nodes.generate_node import generate_node


def route_after_approval(state):

    if state["approved"]:
        return "generate"

    return END


def build_graph():

    graph = StateGraph(MigrationState)

    graph.add_node(
        "analyze",
        analyze_node
    )

    graph.add_node(
        "plan",
        plan_node
    )

    graph.add_node(
        "approval",
        approval_node
    )

    graph.add_node(
        "generate",
        generate_node
    )

    graph.set_entry_point(
        "analyze"
    )

    graph.add_edge(
        "analyze",
        "plan"
    )

    graph.add_edge(
        "plan",
        "approval"
    )

    graph.add_conditional_edges(
        "approval",
        route_after_approval
    )

    graph.add_edge(
        "generate",
        END
    )

    return graph.compile()