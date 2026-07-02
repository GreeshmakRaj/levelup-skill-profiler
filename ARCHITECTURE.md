# Architecture

## System

```mermaid
flowchart LR
    FE["React SPA"] -- "Bearer JWT" --> API["FastAPI"]
    FE -- "sign in" --> AUTH["Supabase Auth"]
    API -- "verify JWT" --> AUTH
    API -- "service role" --> DB[("Postgres")]
    API -- "resumes" --> STORE[["Supabase Storage"]]
    API -- "prompts" --> LLM["Gemini"]
```

## Analysis pipeline — `POST /api/v1/skill-analysis`

```mermaid
flowchart LR
    R["Resume + self-assessment"] --> E["1. Extract skills (LLM)"]
    E --> C["2. Consolidate (local)"]
    C --> I["3. Infer role (LLM)"]
    I --> A["4. Role alignment (LLM)"]
    A --> G["5. Skill gaps (LLM)"]
    G --> DB[("user_skill_details")]
```

## Data model

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
    }
```

- `skills_assessment` → `{ "Java": 8 }`
- `skills_gap_analysis` → `[{ "skill": "SQL", "requiredLevel": 10 }]`

## RBAC

Enforced in `core/auth.py` (`get_current_user` + `require_roles`).

- **Admin** — creates Managers/Employees
- **Manager** — creates own Employees + runs analysis
- **Employee** — runs analysis

## Layout

```
backend/app/   main.py · api/ · core/ · schemas/ · services/
frontend/src/  App.jsx · pages/ · components/ · hooks/ · services/ · constants/
```
