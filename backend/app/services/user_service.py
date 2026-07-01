"""
User lifecycle service.

Wraps Supabase Auth admin operations (create / delete auth users) and keeps the
public.users profile table in sync. Authorization is enforced by the API layer;
this module only performs the work.
"""
from fastapi import HTTPException, status

from app.core.constants import Role
from app.core.supabase_client import get_supabase
from app.services import db_service, storage_service


def create_user(
    *,
    username: str,
    email: str,
    password: str,
    role: Role,
    reports_to: str | None,
) -> dict:
    """
    Creates a Supabase Auth user (with the given password) and the matching
    profile row. Returns the profile row.
    """
    if db_service.get_user_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "USER_EXISTS", "message": "A user with this email already exists."},
        )

    sb = get_supabase()

    try:
        created = sb.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"username": username},
            }
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "AUTH_CREATE_FAILED", "message": f"Could not create auth user: {exc}"},
        ) from exc

    auth_user = getattr(created, "user", None)
    if not auth_user or not auth_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "AUTH_CREATE_FAILED", "message": "Auth user creation returned no id."},
        )

    try:
        profile = db_service.insert_user(
            user_id=auth_user.id,
            email=email,
            role=role,
            username=username,
            reports_to=reports_to,
        )
    except Exception as exc:
        # Roll back the auth user so we never leave an orphan.
        _safe_delete_auth_user(auth_user.id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PROFILE_CREATE_FAILED", "message": f"Could not create profile: {exc}"},
        ) from exc

    return profile


def hard_delete_user(user_id: str) -> None:
    """
    Hard delete: removes stored resumes, the profile row, dependent skill rows,
    and the auth user. Deleting the auth user cascades to users and
    user_skill_details via the FK ON DELETE CASCADE, so no orphans remain.
    """
    # 1. Remove resume objects from storage (DB cascade won't touch storage).
    paths = db_service.list_resume_paths_for_user(user_id)
    storage_service.delete_resumes(paths)

    # 2. Delete the auth user — cascades to users + user_skill_details.
    _safe_delete_auth_user(user_id)

    # 3. Defensive cleanup in case cascade is unavailable.
    db_service.delete_user_row(user_id)


def update_password(user_id: str, new_password: str) -> None:
    sb = get_supabase()
    try:
        sb.auth.admin.update_user_by_id(user_id, {"password": new_password})
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PASSWORD_UPDATE_FAILED", "message": f"Could not update password: {exc}"},
        ) from exc


def _safe_delete_auth_user(user_id: str) -> None:
    sb = get_supabase()
    try:
        sb.auth.admin.delete_user(user_id)
    except Exception:
        # Auth user may already be gone; ignore so cleanup stays idempotent.
        pass
