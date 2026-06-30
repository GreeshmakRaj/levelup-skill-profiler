-- ============================================================
-- Employee Skill Profiler – Supabase Schema (fresh setup)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
--
-- Auth: handled by Supabase Auth (auth.users). The backend validates the
--       bearer token via sb.auth.get_user() and identifies the user by
--       auth.users.id. public.users is a PROFILE table keyed to that id —
--       Supabase Auth owns the credentials (email + encrypted password),
--       so we do NOT store a password here.
--
-- Tables:
--   1. users               -> user_id (PK = auth.users.id)
--   2. user_skill_details  -> skill_id (PK), user_id (FK -> users)
-- Storage:
--   resumes bucket, files stored under {skill_id}/<filename>
-- ============================================================

-- ── 0. Clean slate (drop old objects) ────────────────────────
DROP TABLE IF EXISTS public.user_skill_details CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.skill_profiles CASCADE;  -- legacy table

-- ── 1. users table (profile linked to Supabase Auth) ─────────
CREATE TABLE public.users (
  -- PK is the Supabase Auth user id (auth.users.id), not a new UUID
  user_id          UUID PRIMARY KEY
                     REFERENCES auth.users (id) ON DELETE CASCADE,
  gmail            TEXT NOT NULL UNIQUE,   -- mirrors auth.users.email
  username         TEXT,
  user_role        TEXT NOT NULL DEFAULT 'EMPLOYEE'
                     CHECK (user_role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
  -- self-reference: the manager this user reports to
  reports_to       UUID REFERENCES public.users (user_id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookups
CREATE INDEX idx_users_reports_to ON public.users (reports_to);
CREATE INDEX idx_users_gmail      ON public.users (gmail);

-- ── 2. user_skill_details table ──────────────────────────────
CREATE TABLE public.user_skill_details (
  skill_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL
                             REFERENCES public.users (user_id) ON DELETE CASCADE,
  -- "current_role" is a reserved keyword in PostgreSQL, so it must be quoted
  "current_role"           TEXT,
  targeted_role            TEXT,
  skills_assessment        JSONB NOT NULL DEFAULT '{}',   -- object {}
  skills_gap_analysis      JSONB NOT NULL DEFAULT '[]',   -- array of {skill, requiredLevel}
  role_alignment           TEXT,
  resume_path              TEXT,
  is_skill_path_completed  TEXT NOT NULL DEFAULT 'STARTED'
                             CHECK (is_skill_path_completed
                                    IN ('STARTED', 'IN_PROGRESS', 'COMPLETED')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast lookup of a user's skill records
CREATE INDEX idx_user_skill_details_user_id ON public.user_skill_details (user_id);

-- ── 3. Row-Level Security ────────────────────────────────────
-- Backend uses the service-role key, which bypasses RLS.
-- RLS is enabled as a safety net so the anon key cannot read/write directly.
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_details ENABLE ROW LEVEL SECURITY;
-- No policies added on purpose -> only service_role (which bypasses RLS) has access.

-- ── 4. Storage bucket for resumes ────────────────────────────
-- Resumes are stored at path: {skill_id}/<filename>
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;
-- service_role bypasses storage RLS, so no extra storage policy is required.
