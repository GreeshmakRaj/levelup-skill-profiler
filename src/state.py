from typing import TypedDict


class MigrationState(TypedDict):

    source_code: str

    analysis: str

    plan: str

    approved: bool

    generated_code: str