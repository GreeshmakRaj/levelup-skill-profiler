from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.api.skills import router as skills_router

settings = get_settings()

app = FastAPI(
    title="Employee Skill Profiler Service",
    description="Analyzes employee skills from resume and self-assessment using Gemini AI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS – allow the React frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(skills_router)


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
