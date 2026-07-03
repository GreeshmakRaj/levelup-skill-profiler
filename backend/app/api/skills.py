import json
from datetime import datetime

from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, status

from app.core.auth import get_current_user, require_roles
from app.core.constants import Role
from app.schemas.skill import SkillDetailResponse
from app.services.llm import LLMError, get_provider_info
from app.services.resume_parser import extract_text_from_resume
from app.services.skill_analysis_service import run_full_analysis
from app.services.storage_service import upload_resume, delete_resumes
from app.services import db_service

router = APIRouter(prefix="/api/v1", tags=["Skills"])

# Managers and Employees may run / manage assessments. Admins may not.
require_assessor = require_roles(Role.MANAGER, Role.EMPLOYEE)


def _normalize_gaps(value) -> list[dict]:
    """Coerce stored skills_gap_analysis into a list of {skill, requiredLevel}.

    Handles the current format (list of objects) and older formats
    (list of strings, or {"skillGaps": [...], "requiredSkills": [...]}).
    """
    if isinstance(value, dict):
        value = value.get("skillGaps", [])
    gaps: list[dict] = []
    for g in value or []:
        if isinstance(g, dict) and g.get("skill"):
            level = g.get("requiredLevel")
            gaps.append({
                "skill": str(g["skill"]),
                "requiredLevel": int(level) if isinstance(level, (int, float)) else 0,
            })
        elif isinstance(g, str):
            gaps.append({"skill": g, "requiredLevel": 0})
    return gaps


def _to_response(row: dict) -> SkillDetailResponse:
    # The users table is joined in via Supabase embed (key "users").
    user = row.get("users") or {}
    if isinstance(user, list):
        user = user[0] if user else {}
    return SkillDetailResponse(
        skillId=row["skill_id"],
        userId=row["user_id"],
        username=user.get("username"),
        email=user.get("gmail"),
        currentRole=row.get("current_role") or "",
        targetRole=row.get("targeted_role") or "",
        skills=row.get("skills_assessment") or {},
        skillGaps=_normalize_gaps(row.get("skills_gap_analysis")),
        roleAlignment=row.get("role_alignment") or "ALIGNED",
        resumePath=row.get("resume_path"),
        status=row.get("is_skill_path_completed") or "COMPLETED",
        createdAt=datetime.fromisoformat(row["created_at"]),
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/skill-analysis  (Manager + Employee)
# ────────────────────────────────────────────────────────────────

@router.post(
    "/skill-analysis",
    response_model=SkillDetailResponse,
    summary="Analyze skills from resume + self-assessment and persist the result",
)
async def analyze_skills(
    currentRole: str = Form(...),
    targetRole: str = Form(...),
    resume: UploadFile = File(...),
    selfAssessment: str = Form(default="{}"),
    user: dict = Depends(require_assessor),
):
    # 1. Parse self-assessment JSON string (optional — defaults to no ratings)
    try:
        assessment: dict[str, int] = json.loads(selfAssessment or "{}")
        if not isinstance(assessment, dict):
            raise ValueError
    except (json.JSONDecodeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "selfAssessment must be a valid JSON object."},
        )

    # 2. Extract text from resume (validates format too)
    resume_text = await extract_text_from_resume(resume)
    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "Could not extract text from resume. Ensure the file is not scanned or empty."},
        )

    # 3. Upload resume to Supabase Storage under {skill_id}/...
    skill_id = db_service.new_skill_id()
    resume_path = await upload_resume(resume, skill_id)

    # 4. Run the LLM analysis pipeline (async)
    try:
        result = await run_full_analysis(
            resume_text=resume_text,
            self_assessment=assessment,
            provided_role=currentRole,
            target_role=targetRole,
        )
    except LLMError as exc:
        # Clean up uploaded resume since analysis failed
        await delete_resumes([resume_path])
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "LLM_ERROR", "message": str(exc)},
        )

    # 5. Persist to user_skill_details
    await db_service.insert_skill_details(
        skill_id=skill_id,
        user_id=user["sub"],
        current_role=currentRole,
        targeted_role=targetRole,
        skills_assessment=result["consolidated_skills"],
        skills_gap_analysis=result["skill_gap_analysis"],
        role_alignment=result["role_alignment"],
        resume_path=resume_path,
    )

    # Re-read with the users join so the response carries username + email.
    row = await db_service.get_skill_detail(skill_id)
    response = _to_response(row)
    provider_info = get_provider_info()
    response.llmProvider = provider_info["provider"]
    response.llmModel = provider_info["model"]
    return response


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/skill-analysis  – caller's own assessments (Manager + Employee)
# ────────────────────────────────────────────────────────────────

@router.get(
    "/skill-analysis",
    response_model=list[SkillDetailResponse],
    summary="List the caller's skill assessments (most recent first)",
)
async def list_my_skills(user: dict = Depends(get_current_user)):
    rows = await db_service.list_skill_details(user["sub"])
    return [_to_response(r) for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/skill-analysis/{skill_id}  – full record for one assessment (owner only)
# ────────────────────────────────────────────────────────────────

@router.get(
    "/skill-analysis/{skill_id}",
    response_model=SkillDetailResponse,
    summary="Get the full user_skill_details record for one of the caller's assessments",
)
async def get_my_skill(skill_id: str, user: dict = Depends(get_current_user)):
    row = await db_service.get_skill_detail(skill_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Assessment not found."},
        )
    if row["user_id"] != user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "You can only view your own assessments."},
        )
    return _to_response(row)


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/v1/skill-analysis/{skill_id}  (owner: Manager + Employee)
# ────────────────────────────────────────────────────────────────

@router.delete(
    "/skill-analysis/{skill_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete one of the caller's skill assessments (and its resume)",
)
async def delete_my_skill(skill_id: str, user: dict = Depends(require_assessor)):
    row = await db_service.get_skill_detail(skill_id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Assessment not found."},
        )
    if row["user_id"] != user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "You can only delete your own assessments."},
        )

    await delete_resumes([row["resume_path"]] if row.get("resume_path") else [])
    await db_service.delete_skill_detail_row(skill_id)
    return None
