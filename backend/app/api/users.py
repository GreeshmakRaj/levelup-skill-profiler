from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import get_current_user, require_roles
from app.core.constants import Role, AI_SOFTWARE_ROLES
from app.schemas.user import (
    CreateUserRequest,
    CreateUserResponse,
    UserResponse,
    ResetPasswordRequest,
    UpdateMeRequest,
    MeResponse,
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


def _to_user_response(row: dict, name_lookup: dict[str, str | None]) -> UserResponse:
    return UserResponse(
        userId=row["user_id"],
        username=row.get("username"),
        email=row["gmail"],
        role=Role(row["user_role"]),
        reportsTo=row.get("reports_to"),
        reportsToName=name_lookup.get(row.get("reports_to")),
        createdAt=datetime.fromisoformat(row["created_at"]),
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/me  – current user's profile (any authenticated user)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/me", response_model=MeResponse, summary="Get the current user's profile")
def get_me(user: dict = Depends(get_current_user)):
    manager = db_service.get_user_profile(user["reports_to"]) if user.get("reports_to") else None
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
def update_me(payload: UpdateMeRequest, user: dict = Depends(get_current_user)):
    db_service.update_username(user["sub"], payload.username.strip())
    profile = db_service.get_user_profile(user["sub"])
    manager = (
        db_service.get_user_profile(profile["reports_to"])
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
def list_role_options(_user: dict = Depends(get_current_user)):
    return AI_SOFTWARE_ROLES


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/users  – Admin: all; Manager: own reports
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserResponse], summary="List manageable users")
def list_users(user: dict = Depends(require_creator)):
    if user["role"] == Role.ADMIN:
        rows = db_service.list_users()
    else:  # Manager → only their direct reports
        rows = db_service.list_users(reports_to=user["sub"])

    name_lookup = {r["user_id"]: _display_name(r) for r in db_service.list_users()}
    return [_to_user_response(r, name_lookup) for r in rows]


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/users  – Admin (Manager/Employee) | Manager (Employee)
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/users",
    response_model=CreateUserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a manager or employee",
)
def create_user(payload: CreateUserRequest, user: dict = Depends(require_creator)):
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
        manager = db_service.get_user_profile(reports_to)
        if not manager or Role(manager["user_role"]) == Role.EMPLOYEE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "INVALID_MANAGER", "message": "Selected reporting manager is invalid."},
            )

    profile = user_service.create_user(
        username=payload.username.strip(),
        email=str(payload.email),
        password=(payload.password or "").strip() or DEFAULT_USER_PASSWORD,
        role=target_role,
        reports_to=reports_to,
    )

    manager = db_service.get_user_profile(reports_to) if reports_to else None
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
def delete_user(user_id: str, user: dict = Depends(require_creator)):
    if user_id == user["sub"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_REQUEST", "message": "You cannot delete your own account."},
        )

    target = db_service.get_user_profile(user_id)
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
        # Only Admin, and only when no employees report to the manager.
        if creator_role != Role.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "Only an admin can delete a manager."},
            )
        if db_service.count_direct_reports(user_id) > 0:
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

    user_service.hard_delete_user(user_id)
    return None


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/auth/reset-password  – any authenticated user resets own password
# ─────────────────────────────────────────────────────────────────────────────

@router.post(
    "/auth/reset-password",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Reset the current user's password",
)
def reset_password(payload: ResetPasswordRequest, user: dict = Depends(get_current_user)):
    user_service.update_password(user["sub"], payload.newPassword)
    return None
