import asyncio
from functools import lru_cache

from supabase import acreate_client, create_client, AsyncClient, Client
from app.core.config import get_settings


# ── Sync client (startup / seeding only) ─────────────────────────────────────

@lru_cache
def get_supabase() -> Client:
    """Sync service-role client — used only during startup seeding."""
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)


# ── Async clients (all API request handlers) ──────────────────────────────────

_async_service: AsyncClient | None = None
_async_anon: AsyncClient | None = None
_service_lock = asyncio.Lock()
_anon_lock = asyncio.Lock()


async def get_async_supabase() -> AsyncClient:
    """Async service-role client — bypasses RLS. Used for all DB / auth-admin ops."""
    global _async_service
    if _async_service is None:
        async with _service_lock:
            if _async_service is None:
                s = get_settings()
                _async_service = await acreate_client(s.supabase_url, s.supabase_service_role_key)
    return _async_service


async def get_async_anon_supabase() -> AsyncClient:
    """Async anon client — used exclusively for sign-in so the service-role
    client's session is never mutated by sign_in_with_password.
    """
    global _async_anon
    if _async_anon is None:
        async with _anon_lock:
            if _async_anon is None:
                s = get_settings()
                _async_anon = await acreate_client(s.supabase_url, s.supabase_anon_key)
    return _async_anon
