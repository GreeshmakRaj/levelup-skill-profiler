# Employee Skill Profiler

AI-powered employee skill analysis service. Employees upload their resume and self-assess their skills — Gemini AI extracts skills, classifies their role, and identifies gaps against their target role.

## Architecture

```
Frontend (React + Vite)  →  FastAPI Backend  →  Gemini AI (LLM)
        ↓                         ↓
  Supabase Auth            Supabase DB + Storage
```

**Hosted free on:**
- Frontend → Vercel
- Backend → Render.com
- DB + Auth + Storage → Supabase
- LLM → Google Gemini (free tier)

---

## Step 1 — Create a Supabase project (Database + Auth + Storage)

1. Go to https://supabase.com and click **Start your project**
2. Sign up with GitHub (free)
3. Click **New project** → choose a name (e.g. `skill-profiler`) → set a DB password → pick a region → **Create project**
4. Wait ~2 minutes for it to provision

### Get your Supabase keys

In your project dashboard → **Settings → API**:

| What you need | Where to find it |
|---|---|
| `SUPABASE_URL` | "Project URL" |
| `SUPABASE_ANON_KEY` | "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key (keep this secret!) |
| `SUPABASE_JWT_SECRET` | Settings → API → JWT Settings → "JWT Secret" |

### Run the database schema

1. In Supabase dashboard → **SQL Editor → New query**
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### Create the storage bucket

1. Supabase dashboard → **Storage → New bucket**
2. Name: `resumes`
3. Public: **OFF** (private)
4. Click **Save**

### Enable email auth

1. Supabase dashboard → **Authentication → Providers**
2. Ensure **Email** is enabled (it is by default)
3. For development, go to **Authentication → Email Templates** and disable email confirmation if you want instant login (optional)

---

## Step 2 — Get a Gemini API key (free)

1. Go to https://aistudio.google.com
2. Sign in with your Google account
3. Click **Get API key → Create API key**
4. Copy the key — this is your `GEMINI_API_KEY`

Free tier gives you: 15 RPM, 1M tokens/day (more than enough for MVP)

---

## Step 3 — Run the backend locally

### Prerequisites
- Python 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — install with:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

### Setup

```bash
cd backend

# Copy env file and fill in your keys
cp .env.example .env
# Edit .env with your Supabase and Gemini keys

# Install dependencies with uv
uv sync

# Run the dev server
uv run uvicorn app.main:app --reload --port 8000
```

The API is now live at http://localhost:8000

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## Step 4 — Run the frontend locally

### Prerequisites
- Node.js 18+ and npm

```bash
cd frontend

# Copy env file and fill in your keys
cp .env.example .env
# Edit .env:
#   VITE_SUPABASE_URL = your Supabase project URL
#   VITE_SUPABASE_ANON_KEY = your Supabase anon key
#   VITE_API_URL = http://localhost:8000

# Install and run
npm install
npm run dev
```

Frontend is now at http://localhost:5173

---

## Step 5 — Deploy the backend to Render (free)

1. Push your code to GitHub
2. Go to https://render.com → Sign up (free)
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Settings:
   - **Root directory:** `backend`
   - **Build command:** `pip install uv && uv sync`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance type:** Free
6. Add environment variables (from your `.env`):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `GEMINI_API_KEY`
   - `APP_ENV` = `production`
   - `CORS_ORIGINS` = `https://your-app.vercel.app` (update after Step 6)
7. Click **Create Web Service**

> ⚠️ Free Render services sleep after 15 minutes of inactivity. First request after sleep takes ~30s to wake up. Fine for MVP.

Note your Render URL (e.g. `https://skill-profiler-api.onrender.com`)

---

## Step 6 — Deploy the frontend to Vercel (free)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project → Import** your repo
3. Set **Root directory** to `frontend`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = your Render URL from Step 5
5. Click **Deploy**

After deploy, copy your Vercel URL and update `CORS_ORIGINS` in your Render env vars.

---

## API Reference

### POST /api/v1/skills/analyze

Analyzes employee skills from resume + self-assessment.

**Auth:** Bearer JWT (from Supabase)  
**Content-Type:** multipart/form-data

| Field | Type | Description |
|---|---|---|
| `employeeId` | string | Unique employee identifier |
| `currentRole` | string | Employee's current role |
| `targetRole` | string | Desired target role |
| `resume` | file | PDF or DOCX resume |
| `selfAssessment` | JSON string | `{"Java": 8, "AWS": 5}` |

**Response:**
```json
{
  "analysisId": "ANL-A1B2C3D4",
  "employeeId": "EMP001",
  "providedRole": "Senior Java Developer",
  "inferredRole": "Senior Backend Engineer",
  "targetRole": "AI Solution Architect",
  "skills": { "Java": 8, "Spring Boot": 8, "AWS": 6 },
  "skillGaps": ["Python", "Machine Learning", "RAG", "LLM"],
  "roleAlignment": "ALIGNED",
  "analyzedAt": "2026-06-25T12:30:00Z",
  "status": "COMPLETED"
}
```

---

### GET /api/v1/employees/{employeeId}/skills

Retrieves the latest skill profile for an employee.

**Auth:** Bearer JWT

**Response:**
```json
{
  "employeeId": "EMP001",
  "providedRole": "Senior Java Developer",
  "inferredRole": "Senior Backend Engineer",
  "targetRole": "AI Solution Architect",
  "skills": { "Java": 8, "Spring Boot": 8 },
  "skillGaps": ["Python", "Machine Learning"],
  "roleAlignment": "ALIGNED",
  "lastUpdated": "2026-06-25T12:30:00Z"
}
```

---

## Project Structure

```
skill-profiler/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── skills.py          # API endpoints
│   │   ├── core/
│   │   │   ├── auth.py            # JWT validation
│   │   │   ├── config.py          # Settings
│   │   │   └── supabase_client.py # DB client
│   │   ├── services/
│   │   │   ├── gemini_service.py  # All AI logic
│   │   │   ├── resume_parser.py   # PDF/DOCX text extraction
│   │   │   ├── storage_service.py # Resume file upload
│   │   │   └── db_service.py      # DB read/write
│   │   ├── schemas/
│   │   │   └── skill.py           # Pydantic models
│   │   └── main.py                # FastAPI app
│   ├── pyproject.toml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Login / Register
│   │   │   └── Dashboard.jsx      # Main 3-step flow + results
│   │   ├── components/
│   │   │   ├── SelfAssessmentInput.jsx
│   │   │   └── SkillProfileCard.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.jsx        # Auth context
│   │   ├── services/
│   │   │   ├── api.js             # Backend API calls
│   │   │   └── supabase.js        # Supabase client
│   │   └── main.jsx
│   └── .env.example
├── supabase/
│   └── schema.sql                 # Run this in Supabase SQL Editor
└── render.yaml                    # Render deployment config
```

---

## What Gemini Does (AI Pipeline)

For each analysis request, five Gemini calls are made:

1. **Skill Extraction** — reads resume text, outputs `{"Java": 8, "AWS": 6, ...}`
2. **Skill Consolidation** — merges resume skills + self-assessment (averages overlaps)
3. **Role Inference** — classifies current role from skill pattern
4. **Role Alignment** — checks if declared role matches inferred role
5. **Gap Analysis** — identifies skills missing or below level 6 for target role

All results are stored in Supabase for retrieval by downstream teams (Learning Recommendation, AI Tutor, Assessment Engine).

---

## For Downstream Teams

Your team's API consumer credentials:
- Use `GET /api/v1/employees/{employeeId}/skills` to fetch any employee's latest profile
- You'll need a valid JWT — coordinate with Team 1 for a service account token
- Output format is stable — `skills`, `skillGaps`, `targetRole`, `roleAlignment` are guaranteed fields
