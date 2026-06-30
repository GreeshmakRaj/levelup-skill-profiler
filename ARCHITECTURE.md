# Architecture — AI-Tutor (Employee Skill Profiler)

Role-based platform. Managers/employees upload a resume + self-assessment;
Google Gemini extracts skills, infers role, checks alignment, and computes skill
gaps vs a target role. Admins manage users.

**Stack:** React + Vite (SPA) · FastAPI · Supabase (Postgres + Auth + Storage) ·
Gemini (`gemini-2.5-flash`).

## System

```mermaid
flowchart LR
    FE["React SPA"] -- "Bearer JWT" --> API["FastAPI"]
    FE -- "sign in" --> AUTH["Supabase Auth"]
    API -- "verify JWT" --> AUTH
    API -- "service role" --> DB[("Postgres: users, user_skill_details")]
    API -- "resumes" --> STORE[["Supabase Storage"]]
    API -- "prompts" --> LLM["Gemini"]
```

## Analysis flow — `POST /api/v1/skill-analysis`

`gemini_service.run_full_analysis()`: parse resume → 5-stage pipeline → persist.

```mermaid
flowchart LR
    R["Resume text + self-assessment"] --> E["1. extract skills (LLM)"]
    E --> C["2. consolidate (local)"]
    C --> I["3. infer role (LLM)"]
    I --> A["4. role alignment (LLM)"]
    A --> G["5. skill gaps -> [skill, requiredLevel] (LLM)"]
    G --> DB[("user_skill_details")]
```

Role inference is internal — it only feeds the alignment check and is not stored.

## Data model

Backend uses the Supabase service-role key (bypasses RLS).

```mermaid
erDiagram
    USERS ||--o{ USER_SKILL_DETAILS : has
    USERS ||--o{ USERS : reports_to
    USERS {
        uuid user_id PK
        text gmail
        text username
        text user_role
        uuid reports_to FK
    }
    USER_SKILL_DETAILS {
        uuid skill_id PK
        uuid user_id FK
        text current_role
        text targeted_role
        jsonb skills_assessment
        jsonb skills_gap_analysis
        text role_alignment
        text resume_path
        text is_skill_path_completed
    }
```

- `skills_assessment` → `{ "Java": 8 }`
- `skills_gap_analysis` → `[ { "skill": "SQL", "requiredLevel": 10 } ]`

## RBAC

Admin → creates Managers/Employees · Manager → creates own Employees + runs
analysis · Employee → runs analysis. Enforced in `core/auth.py`
(`get_current_user` + `require_roles`).

## Layout

```
backend/app/   main.py · api/(skills,users) · core/(auth,config,constants,supabase_client)
               · schemas/ · services/(gemini,resume_parser,storage,user,db,seed)
frontend/src/  App.jsx · pages/ · components/(ui,layout,users,skills) · hooks/ · services/ · constants/
```
