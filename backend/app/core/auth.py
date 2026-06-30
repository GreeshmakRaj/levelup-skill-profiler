from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase_client import get_supabase

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Validates token by calling Supabase Auth directly.
    Works with both legacy HS256 and new RS256 signing keys.
    """
    token = credentials.credentials
    try:
        sb = get_supabase()
        response = sb.auth.get_user(token)
        if not response or not response.user:
            raise ValueError("No user returned")
        return {"sub": response.user.id, "email": response.user.email}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Invalid or expired authentication token."},
        ) from exc