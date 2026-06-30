from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Shared ────────────────────────────────────────────────────────────────────

class SkillMap(BaseModel):
    """skill_name -> proficiency rating 1-10"""
    model_config = {"extra": "allow"}


# ── POST /skills/analyze ──────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    analysisId: str
    employeeId: str
    providedRole: str
    inferredRole: str
    targetRole: str
    skills: dict[str, int]
    skillGaps: list[str]
    roleAlignment: str          # "ALIGNED" | "MISALIGNED"
    analyzedAt: datetime
    status: str                 # "COMPLETED" | "FAILED"


# ── GET /employees/{id}/skills ────────────────────────────────────────────────

class SkillProfileResponse(BaseModel):
    employeeId: str
    providedRole: str
    inferredRole: str
    targetRole: str
    skills: dict[str, int]
    skillGaps: list[str]
    roleAlignment: str
    lastUpdated: datetime


# ── Error ─────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    code: str
    message: str
