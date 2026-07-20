# Use the OS trust store (Windows/macOS/Linux) so corporate TLS-intercepting
# proxies with a custom root CA don't break backend→Supabase HTTPS. Must run
# before any httpx/supabase client is created.
import truststore
truststore.inject_into_ssl()

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_oauth2_redirect_html
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from app.core.config import get_settings
from app.api.skills import router as skills_router
from app.api.users import router as users_router
from app.services.seed_service import seed_admin

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Initialise async Supabase clients early so the first request has no cold-start.
    from app.core.supabase_client import get_async_supabase, get_async_anon_supabase
    await get_async_supabase()
    await get_async_anon_supabase()
    # Seed the first admin once (idempotent — no-op if one already exists).
    await seed_admin()
    yield


app = FastAPI(
    title="Employee Skill Profiler Service",
    description="Analyzes employee skills from resume and self-assessment using Gemini AI.",
    version="1.0.0",
    docs_url=None,        # served manually below with custom request interceptor
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS – allow requests from any origin (any team/server). We use a regex
# that matches everything instead of allow_origins=["*"], because browsers
# reject a literal wildcard origin when allow_credentials=True; the regex
# approach reflects back the actual request origin, which works with credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(skills_router)
app.include_router(users_router)


# ─── OpenAPI 3.0 downgrade for Swagger UI file-upload rendering ───────────────
# FastAPI emits OpenAPI 3.1 by default, which describes file fields as
# {"type": "string", "contentMediaType": "..."}. Swagger UI (as of 5.x) does not
# reliably render that as a file-picker button — it falls back to a plain text
# box. OpenAPI 3.0's {"type": "string", "format": "binary"} is universally
# supported, so we downgrade the served spec and rewrite binary fields.
def _custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    from fastapi.openapi.utils import get_openapi

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    schema["openapi"] = "3.0.3"

    def _fix_binary(node):
        if isinstance(node, dict):
            if node.get("contentMediaType") == "application/octet-stream" and node.get("type") == "string":
                node.pop("contentMediaType", None)
                node.pop("contentEncoding", None)
                node["format"] = "binary"
            for v in node.values():
                _fix_binary(v)
        elif isinstance(node, list):
            for v in node:
                _fix_binary(v)

    _fix_binary(schema.get("components", {}).get("schemas", {}))
    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = _custom_openapi


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


# ─── Login page HTML ──────────────────────────────────────────────────────────
_LOGIN_HTML = """\
<!DOCTYPE html><html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI-Tutor -- Sign in</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:40px;width:100%;max-width:400px;box-shadow:0 25px 50px rgba(0,0,0,.5)}
h1{color:#f1f5f9;font-size:22px;font-weight:700;text-align:center}
.sub{color:#64748b;font-size:13px;text-align:center;margin:6px 0 28px}
label{display:block;color:#cbd5e1;font-size:13px;font-weight:500;margin-bottom:6px}
input{width:100%;padding:10px 14px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#f1f5f9;font-size:14px;outline:none;transition:border-color .15s}
input:focus{border-color:#6366f1}
.field{margin-bottom:18px}
button{width:100%;padding:11px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s}
button:hover{background:#4f46e5}
button:disabled{background:#334155;cursor:not-allowed;color:#94a3b8}
.err{background:#450a0a;border:1px solid #7f1d1d;color:#fca5a5;padding:10px 14px;border-radius:8px;font-size:13px;margin-bottom:18px;display:none}
</style></head>
<body><div class="card">
  <h1>AI-Tutor</h1>
  <p class="sub">Sign in to access the API Explorer</p>
  <div class="err" id="err"></div>
  <form id="f">
    <div class="field"><label>Email</label><input type="email" id="em" placeholder="admin@example.com" required autofocus></div>
    <div class="field"><label>Password</label><input type="password" id="pw" placeholder="..." required></div>
    <button id="btn" type="submit">Sign in</button>
  </form>
</div>
<script>
document.getElementById('f').addEventListener('submit',async e=>{
  e.preventDefault();
  const btn=document.getElementById('btn'),err=document.getElementById('err');
  err.style.display='none';btn.disabled=true;btn.textContent='Signing in...';
  try{
    const r=await fetch('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('em').value,password:document.getElementById('pw').value})});
    const d=await r.json();
    if(!r.ok)throw new Error(d?.detail?.message||'Invalid credentials');
    sessionStorage.setItem('access_token',d.accessToken);
    window.location.href='/docs';
  }catch(ex){
    err.textContent=ex.message;err.style.display='block';
    btn.disabled=false;btn.textContent='Sign in';
  }
});
</script>
</body></html>"""


# ─── Custom Swagger UI (auto-injects bearer token from sessionStorage) ─────────
_SWAGGER_HTML = """\
<!DOCTYPE html><html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI-Tutor -- API Explorer</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css">
<style>
body{margin:0}
#topbar{display:flex;align-items:center;justify-content:space-between;background:#1b1b1b;padding:8px 20px;position:sticky;top:0;z-index:1000}
#topbar span{color:#fff;font-family:-apple-system,sans-serif;font-size:14px;font-weight:600}
#topbar button{background:#ef4444;color:#fff;border:none;padding:5px 14px;border-radius:6px;font-size:13px;cursor:pointer;font-family:inherit}
#topbar button:hover{background:#dc2626}
.swagger-ui .topbar{display:none}
</style></head>
<body>
<div id="topbar">
  <span>AI-Tutor -- API Explorer</span>
  <button onclick="sessionStorage.removeItem('access_token');window.location.href='/login'">Sign out</button>
</div>
<div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
<script>
window.onload = function() {
  window.ui = SwaggerUIBundle({
    url: '/openapi.json',
    dom_id: '#swagger-ui',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: 'StandaloneLayout',
    persistAuthorization: true,
    requestInterceptor: function(req) {
      var t = sessionStorage.getItem('access_token');
      if (t) req.headers['Authorization'] = 'Bearer ' + t;
      return req;
    },
    onComplete: function() {
      var t = sessionStorage.getItem('access_token');
      if (t) try { window.ui.preauthorizeApiKey('HTTPBearer', t); } catch(e) {}
    }
  });
};
</script>
</body></html>"""


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/login")


@app.get("/login", include_in_schema=False)
def login_page():
    return HTMLResponse(_LOGIN_HTML)


@app.get("/docs", include_in_schema=False)
def swagger_ui_html():
    return HTMLResponse(_SWAGGER_HTML)


@app.get("/docs/oauth2-redirect", include_in_schema=False)
def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()
