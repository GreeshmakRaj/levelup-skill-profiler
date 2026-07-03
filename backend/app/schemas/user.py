from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.core.constants import Role


# Default password used when none is supplied at creation time.
DEFAULT_USER_PASSWORD = "123456"


# ── Create user ───────────────────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    # Optional — falls back to DEFAULT_USER_PASSWORD when blank.
    password: Optional[str] = Field(default=None, max_length=128)
    role: Role
    # Optional. Only honoured when an Admin creates an Employee.
    # When omitted the reporting manager is resolved server-side.
    reportsTo: Optional[str] = None


class UserResponse(BaseModel):
    userId: str
    username: Optional[str] = None
    email: str
    role: Role
    reportsTo: Optional[str] = None
    reportsToName: Optional[str] = None
    assessmentCount: int = 0
    createdAt: datetime


class CreateUserResponse(UserResponse):
    pass


# ── Reset password ────────────────────────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    newPassword: str = Field(..., min_length=6, max_length=128)


# ── Current user (profile) ────────────────────────────────────────────────────
class UpdateMeRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=120)

class MeResponse(BaseModel):
    userId: str
    username: Optional[str] = None
    email: str
    role: Role
    reportsTo: Optional[str] = None
    reportsToName: Optional[str] = None


# ── Update user (admin) ────────────────────────────────────────────────────────

class UpdateReportsToRequest(BaseModel):
    reportsTo: str = Field(..., description="User ID of the new manager")


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class LoginResponse(BaseModel):
    accessToken: str
    refreshToken: Optional[str] = None
    tokenType: str = "bearer"
    expiresIn: Optional[int] = None
    user: MeResponse
