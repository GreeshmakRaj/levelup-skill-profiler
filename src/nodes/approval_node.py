def approval_node(state):

    print("\n========== APPROVAL ==========")

    choice = input(
        "\nApprove migration plan? (y/n): "
    )

    approved = choice.lower() == "y"

    return {
        "approved": approved
    }