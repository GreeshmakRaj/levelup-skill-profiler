import uuid
from datetime import datetime, timezone
from app.core.supabase_client import get_supabase


def save_analysis(
    employee_id: str,
    provided_role: str,
    inferred_role: str,
    target_role: str,
    skills: dict,
    skill_gaps: list,
    role_alignment: str,
    resume_path: str | None = None,
) -> dict:
    """
    Upserts the skill profile for the employee (one active record per employee).
    Returns the persisted row.
    """
    sb = get_supabase()
    analysis_id = f"ANL-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    record = {
        "analysis_id": analysis_id,
        "employee_id": employee_id,
        "provided_role": provided_role,
        "inferred_role": inferred_role,
        "target_role": target_role,
        "skills": skills,
        "skill_gaps": skill_gaps,
        "role_alignment": role_alignment,
        "resume_path": resume_path,
        "analyzed_at": now,
        "status": "COMPLETED",
    }

    # Upsert: if employee already has a profile, overwrite it
    sb.table("skill_profiles").upsert(
        record, on_conflict="employee_id"
    ).execute()

    return record


def get_latest_profile(employee_id: str) -> dict | None:
    """
    Returns the most recent skill profile for an employee, or None.
    """
    sb = get_supabase()
    result = (
        sb.table("skill_profiles")
        .select("*")
        .eq("employee_id", employee_id)
        .order("analyzed_at", desc=True)
        .limit(1)
        .execute()
    )
    data = result.data
    return data[0] if data else None
