from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    app_env: str = "development"
    cors_origins: str = "http://localhost:5173"
    # First-run admin seeding (secrets — supplied via .env / deploy env vars)
    seed_admin_email: str = ""
    seed_admin_password: str = ""

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
