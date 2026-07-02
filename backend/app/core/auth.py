from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.constants import Role
from app.core.supabase_client import get_supabase
from app.services import db_service

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates the bearer token via Supabase Auth and loads the caller's profile
    (role + reporting line) from the users table.

    Returns a dict: {sub, email, role: Role, reports_to, username}.
    """
    token = credentials.credentials
    try:
        sb = get_supabase()
        response = sb.auth.get_user(token)
        if not response or not response.user:
            raise ValueError("No user returned")
        auth_user = response.user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid or expired authentication token."},
        ) from exc

    profile = db_service.get_user_profile(auth_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "NO_PROFILE", "message": "No profile is associated with this account."},
        )

    return {
        "sub": auth_user.id,
        "email": auth_user.email,
        "role": Role(profile["user_role"]),
        "reports_to": profile.get("reports_to"),
        "username": profile.get("username"),
    }


def require_roles(*allowed: Role):
    """Dependency factory that allows only the given roles."""

    def _dependency(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "You do not have permission to perform this action."},
            )
        return user

    return _dependency