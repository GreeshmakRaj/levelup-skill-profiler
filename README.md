# LevelUp — Employee Skill Profiler

Role-based skill-intelligence platform. Upload a resume + self-assess; Gemini extracts skills, checks role alignment, and computes skill gaps.

**Stack:** React + Vite · FastAPI · Supabase (Postgres + Auth + Storage) · Gemini `gemini-2.5-flash`  
**Hosting:** Vercel (frontend) · Render (backend)  
**Docs:** [ARCHITECTURE.md](ARCHITECTURE.md) · [BUILD.md](BUILD.md)

## Quick start

### 1. Supabase

Create a project → run `supabase/schema.sql` → add a private bucket named `resumes`.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in keys
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install && npm run dev
```

## Env vars

| Scope | Variables |
|-------|-----------|
| Backend | `SUPABASE_URL` `SUPABASE_ANON_KEY` `SUPABASE_SERVICE_ROLE_KEY` `SUPABASE_JWT_SECRET` `GEMINI_API_KEY` `GEMINI_MODEL` `SEED_ADMIN_EMAIL` `SEED_ADMIN_PASSWORD` `CORS_ORIGINS` `APP_ENV` |
| Frontend | `VITE_SUPABASE_URL` `VITE_SUPABASE_ANON_KEY` `VITE_API_URL` |

## Roles

| Capability | Admin | Manager | Employee |
|---|:--:|:--:|:--:|
| Create managers | ✅ | — | — |
| Create employees | ✅ | ✅ | — |
| Delete users | ✅ | own reports | — |
| Run skill analysis | — | ✅ | ✅ |

## API

Base: `/api/v1` · Auth: `Bearer <Supabase JWT>`

| Method | Path | Roles |
|--------|------|-------|
| GET | `/me` | All |
| PATCH | `/me` | All |
| GET | `/job-roles` | All |
| POST | `/skill-analysis` | Manager, Employee |
| GET | `/skill-analysis` | Manager, Employee |
| GET/DELETE | `/skill-analysis/{id}` | Manager, Employee |
| GET/POST | `/users` | Admin, Manager |
| DELETE | `/users/{id}` | Admin, Manager |
| POST | `/auth/reset-password` | All |
| GET | `/health` | — |

## Deploy

- **Backend → Render:** root `backend`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Frontend → Vercel:** root `frontend`, set `VITE_*` vars, point `CORS_ORIGINS` at Vercel URL
