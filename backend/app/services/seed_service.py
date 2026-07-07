"""
First-run admin seeding — async.

Runs once on application startup. If no Admin profile exists and seed credentials
are configured, it creates the Admin via Supabase Auth and inserts the matching
profile row. Idempotent — safe to run on every boot.
"""
import logging

from app.core.config import get_settings
from app.core.constants import Role
from app.core.supabase_client import get_async_supabase
from app.services import db_service

logger = logging.getLogger("seed")


async def seed_admin() -> None:
    settings = get_settings()
    email = (settings.seed_admin_email or "").strip()
    password = settings.seed_admin_password or ""

    if not email or not password:
        logger.info("Admin seeding skipped: seed credentials not configured.")
        return

    try:
        if await db_service.admin_exists():
            logger.info("Admin seeding skipped: an admin already exists.")
            return

        sb = await get_async_supabase()

        existing_profile = await db_service.get_user_by_email(email)
        if existing_profile:
            logger.info("Admin seeding skipped: profile already present for %s.", email)
            return

        try:
            created = await sb.auth.admin.create_user(
                {
                    "email": email,
                    "password": password,
                    "email_confirm": True,
                    "user_metadata": {"username": "Admin"},
                }
            )
            user_id = created.user.id
        except Exception:
            user_id = await _find_auth_user_id(email)
            if not user_id:
                raise

        await db_service.insert_user(
            user_id=user_id,
            email=email,
            role=Role.ADMIN,
            username="Admin",
        )
        logger.info("Seeded first admin user: %s", email)
    except Exception as exc:
        logger.warning("Admin seeding failed (continuing startup): %s", exc)


async def _find_auth_user_id(email: str) -> str | None:
    sb = await get_async_supabase()
    try:
        page = await sb.auth.admin.list_users()
        users = page if isinstance(page, list) else getattr(page, "users", []) or []
        for u in users:
            if (getattr(u, "email", "") or "").lower() == email.lower():
                return u.id
    except Exception:
        return None
    return None
