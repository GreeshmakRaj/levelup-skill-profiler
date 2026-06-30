-- ============================================================
-- Employee Skill Profiler – Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── 1. skill_profiles table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     TEXT NOT NULL,
  employee_id     TEXT NOT NULL UNIQUE,   -- one active profile per employee
  provided_role   TEXT NOT NULL,
  inferred_role   TEXT NOT NULL,
  target_role     TEXT NOT NULL,
  skills          JSONB NOT NULL DEFAULT '{}',
  skill_gaps      JSONB NOT NULL DEFAULT '[]',
  role_alignment  TEXT NOT NULL DEFAULT 'ALIGNED',
  resume_path     TEXT,
  analyzed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by employee
CREATE INDEX IF NOT EXISTS idx_skill_profiles_employee_id
  ON public.skill_profiles (employee_id);

-- ── 2. Row-Level Security ─────────────────────────────────────
-- Enable RLS (backend uses service-role key which bypasses RLS,
-- so this is just a safety net if anon key is ever used)
ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (default for service_role key)
-- No additional policy needed — service_role bypasses RLS

-- ── 3. Storage bucket for resumes ────────────────────────────
-- Run this in Supabase Dashboard → Storage → New bucket
-- OR via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: service role has full access (no extra policy needed)
