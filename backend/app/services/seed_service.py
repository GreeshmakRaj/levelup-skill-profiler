"""
First-run admin seeding.

Runs once on application startup. If no Admin profile exists and seed credentials
are configured, it creates the Admin via Supabase Auth and inserts the matching
profile row. Idempotent — safe to run on every boot.
"""
import logging

from app.core.config import get_settings
from app.core.constants import Role
from app.core.supabase_client import get_supabase
from app.services import db_service

logger = logging.getLogger("seed")


def seed_admin() -> None:
    settings = get_settings()
    email = (settings.seed_admin_email or "").strip()
    password = settings.seed_admin_password or ""

    if not email or not password:
        logger.info("Admin seeding skipped: seed credentials not configured.")
        return

    try:
        if db_service.admin_exists():
            logger.info("Admin seeding skipped: an admin already exists.")
            return

        sb = get_supabase()

        # The auth user may already exist (e.g. profile row was removed). Reuse it.
        existing_profile = db_service.get_user_by_email(email)
        if existing_profile:
            logger.info("Admin seeding skipped: profile already present for %s.", email)
            return

        try:
            created = sb.auth.admin.create_user(
                {
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {"username": "Admin"},
                }
            )
            user_id = created.user.id
        except Exception:
            # Auth user might already exist — look it up instead of failing boot.
            user_id = _find_auth_user_id(email)
            if not user_id:
                raise

        db_service.insert_user(
            user_id=user_id,
            email=email,
            role=Role.ADMIN,
            username="Admin",
        )
        logger.info("Seeded first admin user: %s", email)
    except Exception as exc:  # never block startup on seeding failure
        logger.warning("Admin seeding failed (continuing startup): %s", exc)


def _find_auth_user_id(email: str) -> str | None:
    sb = get_supabase()
    try:
        page = sb.auth.admin.list_users()
        users = page if isinstance(page, list) else getattr(page, "users", []) or []
        for u in users:
            if (getattr(u, "email", "") or "").lower() == email.lower():
                return u.id
    except Exception:
        return None
    return None
