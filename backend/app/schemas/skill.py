from pydantic import BaseModel
from datetime import datetime

from app.core.constants import Role


# ── Skill gap shape ──────────────────────────────────────────────────────

class SkillGap(BaseModel):
    skill: str
    requiredLevel: int        # target proficiency required (1-10)


# ── Shared skill-detail shape ────────────────────────────────────────────

class SkillDetailResponse(BaseModel):
    skillId: str
    userId: str
    username: str | None = None
    email: str | None = None
    currentRole: str
    targetRole: str
    skills: dict[str, int]
    skillGaps: list[SkillGap]
    roleAlignment: str          # "ALIGNED" | "MISALIGNED"
    resumePath: str | None = None
    status: str                 # is_skill_path_completed
    createdAt: datetime
    llmProvider: str | None = None
    llmModel: str | None = None


# ── Employee skill-analysis (manager/admin team view) ────────────────────

class EmployeeInfo(BaseModel):
    userId: str
    username: str | None = None
    email: str | None = None
    role: Role
    reportsTo: str | None = None


class EmployeeSkillAnalysisResponse(BaseModel):
    """One employee together with all of their skill-gap analyses."""
    employee: EmployeeInfo
    skills: list[SkillDetailResponse]

