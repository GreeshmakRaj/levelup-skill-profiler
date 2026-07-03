"""
Database access layer (Supabase / PostgreSQL) â€” fully async.

Tables:
  - public.users               (profile keyed to auth.users.id)
  - public.user_skill_details  (one row per skill analysis)

The backend uses the service-role key, so it bypasses RLS.
"""
import uuid
from datetime import datetime, timezone

from app.core.constants import Role
from app.core.supabase_client import get_async_supabase

USERS_TABLE = "users"
SKILL_DETAILS_TABLE = "user_skill_details"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# â”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async def get_user_profile(user_id: str) -> dict | None:
    sb = await get_async_supabase()
    result = await sb.table(USERS_TABLE).select("*").eq("user_id", user_id).limit(1).execute()
    data = result.data
    return data[0] if data else None


async def get_user_by_email(email: str) -> dict | None:
    sb = await get_async_supabase()
    result = await sb.table(USERS_TABLE).select("*").eq("gmail", email).limit(1).execute()
    data = result.data
    return data[0] if data else None


async def admin_exists() -> bool:
    sb = await get_async_supabase()
    result = await sb.table(USERS_TABLE).select("user_id").eq("user_role", Role.ADMIN.value).limit(1).execute()
    return bool(result.data)


async def get_first_admin_id() -> str | None:
    sb = await get_async_supabase()
    result = await (
        sb.table(USERS_TABLE)
        .select("user_id")
        .eq("user_role", Role.ADMIN.value)
        .order("created_at", desc=False)
        .limit(1)
        .execute()
    )
    data = result.data
    return data[0]["user_id"] if data else None


async def insert_user(
    user_id: str,
    email: str,
    role: Role,
    username: str | None = None,
    reports_to: str | None = None,
) -> dict:
    sb = await get_async_supabase()
    record = {
        "user_id": user_id,
        "gmail": email,
        "user_role": role.value,
        "username": username,
        "reports_to": reports_to,
        "created_at": _now_iso(),
    }
    await sb.table(USERS_TABLE).insert(record).execute()
    return record


async def update_username(user_id: str, username: str) -> dict | None:
    sb = await get_async_supabase()
    result = await (
        sb.table(USERS_TABLE).update({"username": username}).eq("user_id", user_id).execute()
    )
    data = result.data
    return data[0] if data else None


async def list_users(role: Role | None = None, reports_to: str | None = None) -> list[dict]:
    sb = await get_async_supabase()
    query = sb.table(USERS_TABLE).select("*")
    if role is not None:
        query = query.eq("user_role", role.value)
    if reports_to is not None:
        query = query.eq("reports_to", reports_to)
    result = await query.order("created_at", desc=True).execute()
    return result.data or []


async def count_direct_reports(manager_id: str) -> int:
    sb = await get_async_supabase()
    result = await sb.table(USERS_TABLE).select("user_id").eq("reports_to", manager_id).execute()
    return len(result.data or [])


async def delete_user_row(user_id: str) -> None:
    sb = await get_async_supabase()
    await sb.table(USERS_TABLE).delete().eq("user_id", user_id).execute()


# â”€â”€ User skill details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def new_skill_id() -> str:
    return str(uuid.uuid4())


async def insert_skill_details(
    skill_id: str,
    user_id: str,
    current_role: str,
    targeted_role: str,
    skills_assessment: dict,
    skills_gap_analysis: list,
    role_alignment: str,
    resume_path: str | None,
) -> dict:
    sb = await get_async_supabase()
    record = {
        "skill_id": skill_id,
        "user_id": user_id,
        "current_role": current_role,
        "targeted_role": targeted_role,
        "skills_assessment": skills_assessment,
        "skills_gap_analysis": skills_gap_analysis,
        "role_alignment": role_alignment,
        "resume_path": resume_path,
        "is_skill_path_completed": "COMPLETED",
        "created_at": _now_iso(),
    }
    await sb.table(SKILL_DETAILS_TABLE).insert(record).execute()
    return record


async def list_skill_details(user_id: str) -> list[dict]:
    sb = await get_async_supabase()
    result = await (
        sb.table(SKILL_DETAILS_TABLE)
        .select("*, users(username, gmail)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def get_latest_skill_detail(user_id: str) -> dict | None:
    details = await list_skill_details(user_id)
    return details[0] if details else None


async def get_skill_detail(skill_id: str) -> dict | None:
    sb = await get_async_supabase()
    result = await (
        sb.table(SKILL_DETAILS_TABLE)
        .select("*, users(username, gmail)")
        .eq("skill_id", skill_id)
        .limit(1)
        .execute()
    )
    data = result.data
    return data[0] if data else None


async def list_resume_paths_for_user(user_id: str) -> list[str]:
    return [d["resume_path"] for d in await list_skill_details(user_id) if d.get("resume_path")]


async def delete_skill_detail_row(skill_id: str) -> None:
    sb = await get_async_supabase()
    await sb.table(SKILL_DETAILS_TABLE).delete().eq("skill_id", skill_id).execute()


async def update_reports_to(user_id: str, reports_to: str) -> dict | None:
    sb = await get_async_supabase()
    result = await (
        sb.table(USERS_TABLE)
        .update({"reports_to": reports_to})
        .eq("user_id", user_id)
        .execute()
    )
    data = result.data
    return data[0] if data else None


async def get_assessment_counts(user_ids: list[str]) -> dict[str, int]:
    """Returns a {user_id: count} map for the given user IDs in one query."""
    if not user_ids:
        return {}
    sb = await get_async_supabase()
    result = await (
        sb.table(SKILL_DETAILS_TABLE)
        .select("user_id")
        .in_("user_id", user_ids)
        .execute()
    )
    counts: dict[str, int] = {uid: 0 for uid in user_ids}
    for row in result.data or []:
        uid = row["user_id"]
        if uid in counts:
            counts[uid] += 1
    return counts

