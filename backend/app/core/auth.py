import hmac

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader

from app.core.config import get_settings
from app.core.constants import Role
from app.core.supabase_client import get_async_supabase
from app.services import db_service

# auto_error=False on every scheme so a missing header falls through to the
# next auth path instead of raising immediately. This keeps the JWT flow
# unchanged while allowing an API-key fallback for system-to-system calls.
# Explicit scheme_name on each APIKeyHeader — otherwise both default to the
# same "APIKeyHeader" name and collide in the OpenAPI spec, hiding one of them
# from Swagger's Authorize dialog.
bearer_scheme = HTTPBearer(auto_error=False)
api_key_scheme = APIKeyHeader(name="X-API-Key", scheme_name="ApiKeyAuth", auto_error=False)
acting_as_scheme = APIKeyHeader(name="X-Acting-Employee-Id", scheme_name="ActingEmployeeId", auto_error=False)


def _unauthorized(message: str, code: str = "UNAUTHORIZED") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": code, "message": message},
    )


def _no_profile(message: str = "No profile is associated with this account.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"code": "NO_PROFILE", "message": message},
    )


def _build_context(sub: str, email: str | None, profile: dict, *, via: str, client_id: str | None) -> dict:
    """Shape shared by both auth paths so downstream handlers/guards are agnostic."""
    return {
        "sub": sub,
        "email": email,
        "role": Role(profile["user_role"]),
        "reports_to": profile.get("reports_to"),
        "username": profile.get("username"),
        "via": via,             # "jwt" | "api_key" — for auditing, not authorization
        "client_id": client_id,  # None for users; set for S2S callers
    }


async def _user_from_jwt(token: str) -> dict:
    """User path — validate a Supabase access token and load the profile."""
    try:
        sb = await get_async_supabase()
        response = await sb.auth.get_user(token)
        if not response or not response.user:
            raise ValueError("No user returned")
        auth_user = response.user
    except Exception as exc:
        raise _unauthorized("Invalid or expired authentication token.") from exc

    profile = await db_service.get_user_profile(auth_user.id)
    if not profile:
        raise _no_profile()
    return _build_context(auth_user.id, auth_user.email, profile, via="jwt", client_id=None)


async def _user_from_api_key(api_key: str, acting_employee_id: str) -> dict:
    """System-to-system path — validate the shared API key and act as a user.

    Least-privilege: the key may act on behalf of any EMPLOYEE or MANAGER user,
    but never an ADMIN, so admin-only actions stay forbidden over the API-key path.
    """
    expected = get_settings().service_api_key
    # Constant-time comparison; also rejects everything when no key is configured.
    if not expected or not hmac.compare_digest(api_key, expected):
        raise _unauthorized("Invalid API key.")

    profile = await db_service.get_user_profile(acting_employee_id)
    if not profile:
        raise _no_profile("No profile is associated with the acting employee id.")

    if Role(profile["user_role"]) == Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FORBIDDEN",
                "message": "API key may not act on behalf of an admin user.",
            },
        )

    return _build_context(
        acting_employee_id, profile.get("gmail"), profile, via="api_key", client_id="service"
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    api_key: str | None = Depends(api_key_scheme),
    acting_employee_id: str | None = Depends(acting_as_scheme),
) -> dict:
    """
    Resolve the caller into a context dict: {sub, email, role, reports_to, username, via, client_id}.

    Two authentication paths, tried in order:
      1. User    — Authorization: Bearer <supabase-jwt>            (unchanged)
      2. Service — X-API-Key + X-Acting-Employee-Id headers        (additive, S2S)

    The JWT path is always tried first, so existing callers behave exactly as before.
    """
    # 1. User path — Supabase JWT.
    if credentials and (credentials.scheme or "").lower() == "bearer" and credentials.credentials:
        return await _user_from_jwt(credentials.credentials)

    # 2. Service path — API key + acting-as employee id.
    if api_key and acting_employee_id:
        return await _user_from_api_key(api_key, acting_employee_id)

    raise _unauthorized("Missing authentication credentials.")



def require_roles(*allowed: Role):
    """Dependency factory that allows only the given roles."""

    async def _dependency(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": "You do not have permission to perform this action."},
            )
        return user

    return _dependency