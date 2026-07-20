from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # ── LLM providers (loaded from backend/.env) ──
    # Priority order (comma-separated). Free-tier friendly providers first.
    llm_providers: str

    gemini_api_key: str = ""
    gemini_model: str = ""

    groq_api_key: str = ""
    groq_model: str = ""

    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"
    # First-run admin seeding (secrets — supplied via .env / deploy env vars)
    seed_admin_email: str = ""
    seed_admin_password: str = ""

    # System-to-system (S2S) API key for trusted backends (e.g. other teams)
    # calling on behalf of an employee. Empty = the API-key auth path is
    # disabled and only Supabase JWTs are accepted (no behaviour change).
    service_api_key: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = str(_ENV_FILE)
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
