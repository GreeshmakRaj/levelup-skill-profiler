from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user, require_roles
from app.core.constants import Role, AI_SOFTWARE_ROLES
from app.core.supabase_client import get_async_anon_supabase
from app.schemas.user import (
    CreateUserRequest,
    CreateUserResponse,
    UserResponse,
    ResetPasswordRequest,
    UpdateMeRequest,
    UpdateReportsToRequest,
    MeResponse,
    LoginRequest,
    LoginResponse,
    DEFAULT_USER_PASSWORD,
)
from app.services import db_service, user_service

router = APIRouter(prefix="/api/v1", tags=["Users"])

require_creator = require_roles(Role.ADMIN, Role.MANAGER)


def _display_name(row: dict | None) -> str | None:
    if not row:
        return None
    name = (row.get("username") or "").strip()
    return name or None


def _to_user_response(row: dict, name_lookup: dict[str, str | None], assessment_counts: dict[str, int] | None = None) -> UserResponse:
    return UserResponse(
        userId=row["user_id"],
        username=row.get("username"),
        email=row["gmail"],
        role=Role(row["user_role"]),
        reportsTo=row.get("reports_to"),
        reportsToName=name_lookup.get(row.get("reports_to")),
        assessmentCount=(assessment_counts or {}).get(row["user_id"], 0),
        createdAt=datetime.fromisoformat(row["created_at"]),
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/me  – current user's profile (any authenticated user)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=MeResponse, summary="Get the current user's profile")
async def get_me(user: dict = Depends(get_current_user)):
    manager = await db_service.get_user_profile(user["reports_to"]) if user.get("reports_to") else None
    return MeResponse(
        userId=user["sub"],
        username=user.get("username"),
        email=user["email"],
        role=user["role"],
        reportsTo=user.get("reports_to"),
        reportsToName=_display_name(manager),
    )


# ─────────────────────────────────────────────────────────────────────────────# PATCH /api/v1/me  – update the current user's username
# ────────────────────────────────────────────────────────────────────────

@router.patch("/me", response_model=MeResponse, summary="Update the current user's username")
async def update_me(payload: UpdateMeRequest, user: dict = Depends(get_current_user)):
    await db_service.update_username(user["sub"], payload.username.strip())
    profile = await db_service.get_user_profile(user["sub"])
    manager = (
        await db_service.get_user_profile(profile["reports_to"])
        if profile and profile.get("reports_to")
        else None
    )
    return MeResponse(
        userId=user["sub"],
        username=(profile.get("username") if profile else payload.username.strip()),
        email=user["email"],
        role=user["role"],
        reportsTo=(profile.get("reports_to") if profile else None),
        reportsToName=_display_name(manager),
    )


# ────────────────────────────────────────────────────────────────────────# GET /api/v1/roles  – role options for the searchable dropdowns
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/job-roles", response_model=list[str], summary="List current/target role options")
async def list_role_options(_user: dict = Depends(get_current_user)):
    return AI_SOFTWARE_ROLES


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/users  – Admin: all; Manager: own reports
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse], summary="List manageable users")
async def list_users(user: dict = Depends(require_creator)):
    if user["role"] == Role.ADMIN:
        rows = await db_service.list_users()
    else:
        rows = await db_service.list_users(reports_to=user["sub"])

    all_rows = await db_service.list_users()
    name_lookup = {r["user_id"]: _display_name(r) for r in all_rows}
    user_ids = [r["user_id"] for r in rows]
    assessment_counts = await db_service.get_assessment_counts(user_ids)
    return [_to_user_response(r, name_lookup, assessment_counts) for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/users  – Admin (Manager/Employee) | Manager (Employee)
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/users",
    response_model=CreateUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a manager or employee",
)
async def create_user(payload: CreateUserRequest, user: dict = Depends(require_creator)):
    creator_role = user["role"]
    creator_id = user["sub"]
    target_role = payload.role

    if target_role == Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Admin accounts cannot be created via this endpoint."},
        )

    # Authorization + reporting-line resolution
    if creator_role == Role.ADMIN:
        if target_role == Role.MANAGER:
            reports_to = creator_id  # Manager reports to the Admin
        else:  # EMPLOYEE — Admin may choose a manager; default to Admin
            reports_to = payload.reportsTo or creator_id
    elif creator_role == Role.MANAGER:
        if target_role != Role.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Managers can only create employees."},
            )
        reports_to = creator_id  # Employee reports to the creating Manager
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "You do not have permission to create users."},
        )

    # Validate the chosen manager exists and is actually a manager/admin
    if reports_to:
        manager = await db_service.get_user_profile(reports_to)
        if not manager or Role(manager["user_role"]) == Role.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_MANAGER", "message": "Selected reporting manager is invalid."},
            )

    profile = await user_service.create_user(
        username=payload.username.strip(),
        email=str(payload.email),
        password=(payload.password or "").strip() or DEFAULT_USER_PASSWORD,
        role=target_role,
        reports_to=reports_to,
    )

    manager = await db_service.get_user_profile(reports_to) if reports_to else None
    return CreateUserResponse(
        userId=profile["user_id"],
        username=profile.get("username"),
        email=profile["gmail"],
        role=Role(profile["user_role"]),
        reportsTo=profile.get("reports_to"),
        reportsToName=_display_name(manager),
        createdAt=datetime.fromisoformat(profile["created_at"]),
    )


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/v1/users/{user_id}  – hard delete
# ─────────────────────────────────────────────────────────────────────────────

@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Hard-delete a user and all dependent records",
)
async def delete_user(user_id: str, user: dict = Depends(require_creator)):
    if user_id == user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "You cannot delete your own account."},
        )

    target = await db_service.get_user_profile(user_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found."},
        )

    target_role = Role(target["user_role"])
    creator_role = user["role"]

    if target_role == Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Admin accounts cannot be deleted."},
        )

    if target_role == Role.MANAGER:
        if creator_role != Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Only an admin can delete a manager."},
            )
        if await db_service.count_direct_reports(user_id) > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "MANAGER_HAS_REPORTS", "message": "Reassign or remove this manager's employees before deleting them."},
            )
    else:  # EMPLOYEE
        if creator_role == Role.MANAGER and target.get("reports_to") != user["sub"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Managers can only delete their own employees."},
            )

    await user_service.hard_delete_user(user_id)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/v1/users/{user_id}/reports-to  – Admin: reassign manager
# ─────────────────────────────────────────────────────────────────────────────

@router.patch(
    "/users/{user_id}/reports-to",
    response_model=UserResponse,
    summary="Reassign the manager a user reports to (Admin only)",
)
async def update_reports_to(
    user_id: str,
    payload: UpdateReportsToRequest,
    _admin: dict = Depends(require_roles(Role.ADMIN)),
):
    target = await db_service.get_user_profile(user_id)
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found."},
        )
    if Role(target["user_role"]) == Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "Cannot change reports_to for an Admin."},
        )
    if payload.reportsTo == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "A user cannot report to themselves."},
        )
    new_manager = await db_service.get_user_profile(payload.reportsTo)
    if not new_manager or Role(new_manager["user_role"]) not in (Role.ADMIN, Role.MANAGER):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_MANAGER", "message": "The selected user must be a Manager or Admin."},
        )
    updated = await db_service.update_reports_to(user_id, payload.reportsTo)
    if not updated:
        updated = await db_service.get_user_profile(user_id)
    name_lookup = {r["user_id"]: _display_name(r) for r in await db_service.list_users()}
    counts = await db_service.get_assessment_counts([user_id])
    return _to_user_response(updated, name_lookup, counts)
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/auth/reset-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Reset the current user's password",
)
async def reset_password(payload: ResetPasswordRequest, user: dict = Depends(get_current_user)):
    await user_service.update_password(user["sub"], payload.newPassword)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/auth/login  — hidden from Swagger, used by the /login page
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/auth/login",
    response_model=LoginResponse,
    include_in_schema=False,
    summary="Log in with email + password and return a bearer token",
)
async def login(payload: LoginRequest):
    sb = await get_async_anon_supabase()
    try:
        result = await sb.auth.sign_in_with_password(
            {"email": str(payload.email), "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."},
        ) from exc

    session = getattr(result, "session", None)
    auth_user = getattr(result, "user", None)
    if not session or not auth_user or not session.access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."},
        )

    profile = await db_service.get_user_profile(auth_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "NO_PROFILE", "message": "No profile is associated with this account."},
        )

    manager = (
        await db_service.get_user_profile(profile["reports_to"])
        if profile.get("reports_to")
        else None
    )
    me = MeResponse(
        userId=auth_user.id,
        username=profile.get("username"),
        email=auth_user.email,
        role=Role(profile["user_role"]),
        reportsTo=profile.get("reports_to"),
        reportsToName=_display_name(manager),
    )
    return LoginResponse(
        accessToken=session.access_token,
        refreshToken=getattr(session, "refresh_token", None),
        expiresIn=getattr(session, "expires_in", None),
        user=me,
    )
