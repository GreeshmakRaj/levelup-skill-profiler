# Use the OS trust store (Windows/macOS/Linux) so corporate TLS-intercepting
# proxies with a custom root CA don't break backend→Supabase HTTPS. Must run
# before any httpx/supabase client is created.
import truststore
truststore.inject_into_ssl()

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.api.skills import router as skills_router
from app.api.users import router as users_router
from app.services.seed_service import seed_admin

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Seed the first admin once (idempotent — no-op if one already exists).
    seed_admin()
    yield


app = FastAPI(
    title="Employee Skill Profiler Service",
    description="Analyzes employee skills from resume and self-assessment using Gemini AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS – allow the configured frontend origins. In development also allow any
# localhost port, so Vite picking a fallback port (5174, 5175, …) doesn't break.
_dev = settings.app_env != "production"
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"http://localhost:\d+" if _dev else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(skills_router)
app.include_router(users_router)


# Global error handler so unhandled exceptions return consistent JSON
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_SERVER_ERROR", "message": "Unable to complete skill analysis."},
    )


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
