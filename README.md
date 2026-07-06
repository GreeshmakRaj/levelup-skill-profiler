# LevelUp — Employee Skill Profiler

Role-based skill intelligence platform. Users upload a resume and self-assess their skills; the backend uses LLM-driven analysis to extract skills, infer role alignment, and identify skill gaps.

**Stack:** React + Vite · FastAPI · Supabase (Auth + Postgres + Storage) · Gemini / Groq  
**Hosting:** Vercel (frontend) · Render (backend)  
**Docs:** [ARCHITECTURE.md](ARCHITECTURE.md) · [BUILD.md](BUILD.md)

## Project overview

- **Frontend:** React SPA in `frontend/`
- **Backend:** FastAPI service in `backend/`
- **Auth and data:** Supabase Auth, Postgres, and Storage
- **Resume storage:** private Supabase bucket named `resumes`
- **Default local URLs:** frontend `http://localhost:5173`, backend `http://localhost:8000`

## Prerequisites

Install these before running the project locally:

- Python 3.11 or newer
- Node.js 18 or newer
- npm
- Optional: `uv` for Python dependency management: https://docs.astral.sh/uv/
- A Supabase project
- A Gemini API key if you use the default LLM provider

## Local setup

### 1. Clone the repository

```powershell
git clone <repo-url>
cd levelup-skill-profiler
```

### 2. Set up Supabase

1. Create a Supabase project.
2. Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.
3. Create a **private** storage bucket named `resumes`.
4. Collect the Project URL, Anon key, Service role key, and JWT secret from the Supabase project settings.

### 3. Configure the backend environment

```powershell
cd backend
Copy-Item .env.example .env
```

Update `backend/.env` with real values. The main variables are:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `LLM_PROVIDERS=gemini`
- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- `APP_ENV=development`
- `CORS_ORIGINS=http://localhost:5173`

Optional first-run admin seed:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

### 4. Configure the frontend environment

```powershell
cd ..\frontend
Copy-Item .env.example .env
```

Update `frontend/.env` with:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL=http://localhost:8000`

## Run the backend

Use the standard Python virtual environment flow as the default setup for all collaborators.

### Recommended: standard Python setup

#### Windows PowerShell

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e .
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

#### macOS or Linux

```bash
cd backend
python3 -m venv .venv
./.venv/bin/python -m pip install -e .
./.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

### Optional: using `uv`

If you already have `uv` installed, you can use:

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.

Useful endpoints:

- Health check: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

## Run the frontend

Open a second terminal in the repository root and run:

```bash
cd frontend
npm install
npm run dev
```

If you are using Windows PowerShell and `npm` is blocked by execution policy, use `npm.cmd install` and `npm.cmd run dev` instead.

The frontend will be available at `http://localhost:5173`.

## Recommended order to start locally

1. Start the backend first.
2. Confirm `http://localhost:8000/health` returns `{"status":"ok"}`.
3. Start the frontend.
4. Open `http://localhost:5173` in the browser.
5. Sign in with a Supabase user, or use the seeded admin account if you set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Stop the app

Press `Ctrl+C` in both terminals.

## Env vars summary

| Scope | Variables |
|-------|-----------|
| Backend | `SUPABASE_URL` `SUPABASE_ANON_KEY` `SUPABASE_SERVICE_ROLE_KEY` `SUPABASE_JWT_SECRET` `LLM_PROVIDERS` `GEMINI_API_KEY` `GEMINI_MODEL` `GROQ_API_KEY` `GROQ_MODEL` `SEED_ADMIN_EMAIL` `SEED_ADMIN_PASSWORD` `CORS_ORIGINS` `APP_ENV` |
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
- **Frontend → Vercel:** root `frontend`, set `VITE_*` vars, point `CORS_ORIGINS` at the deployed frontend URL
