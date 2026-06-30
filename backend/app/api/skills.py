import json
from datetime import datetime
from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.schemas.skill import AnalyzeResponse, SkillProfileResponse
from app.services.resume_parser import extract_text_from_resume
from app.services.gemini_service import run_full_analysis
from app.services.storage_service import upload_resume
from app.services.db_service import save_analysis, get_latest_profile

router = APIRouter(prefix="/api/v1", tags=["Skills"])


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/skills/analyze
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/skills/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze employee skills from resume + self-assessment",
)
async def analyze_skills(
    employeeId: str = Form(...),
    currentRole: str = Form(...),
    targetRole: str = Form(...),
    resume: UploadFile = File(...),
    selfAssessment: str = Form(...),
    _user: dict = Depends(get_current_user),
):
    # 1. Parse self-assessment JSON string
    try:
        assessment: dict[str, int] = json.loads(selfAssessment)
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

    # 3. Upload resume to Supabase Storage (rewind first)
    await resume.seek(0)
    resume_path = await upload_resume(resume, employeeId)

    # 4. Run full Gemini analysis pipeline
    result = run_full_analysis(
        resume_text=resume_text,
        self_assessment=assessment,
        provided_role=currentRole,
        target_role=targetRole,
    )

    # 5. Persist to DB
    record = save_analysis(
        employee_id=employeeId,
        provided_role=currentRole,
        inferred_role=result["inferred_role"],
        target_role=targetRole,
        skills=result["consolidated_skills"],
        skill_gaps=result["skill_gaps"],
        role_alignment=result["role_alignment"],
        resume_path=resume_path,
    )

    return AnalyzeResponse(
        analysisId=record["analysis_id"],
        employeeId=employeeId,
        providedRole=currentRole,
        inferredRole=result["inferred_role"],
        targetRole=targetRole,
        skills=result["consolidated_skills"],
        skillGaps=result["skill_gaps"],
        roleAlignment=result["role_alignment"],
        analyzedAt=datetime.fromisoformat(record["analyzed_at"]),
        status="COMPLETED",
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/employees/{employeeId}/skills
# ─────────────────────────────────────────────────────────────────────────────

@router.get(
    "/employees/{employeeId}/skills",
    response_model=SkillProfileResponse,
    summary="Retrieve latest skill profile for an employee",
)
def get_employee_skills(
    employeeId: str,
    _user: dict = Depends(get_current_user),
):
    profile = get_latest_profile(employeeId)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": f"No skill profile found for employee {employeeId}."},
        )

    return SkillProfileResponse(
        employeeId=profile["employee_id"],
        providedRole=profile["provided_role"],
        inferredRole=profile["inferred_role"],
        targetRole=profile["target_role"],
        skills=profile["skills"],
        skillGaps=profile["skill_gaps"],
        roleAlignment=profile["role_alignment"],
        lastUpdated=datetime.fromisoformat(profile["analyzed_at"]),
    )
