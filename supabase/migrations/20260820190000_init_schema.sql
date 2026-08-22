-- Phase 2 schema (docs/PLAN.md Section 9.1), extended with `client` to match
-- the live Project model in ui/src/types/content.ts and api/internal/models.
--
-- Before linking a hosted Supabase project: add RLS policies (or disable the
-- PostgREST API for these tables). The Go API uses the direct Postgres URL
-- and does not rely on anon PostgREST access.

CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  client        TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT '',
  summary       TEXT NOT NULL DEFAULT '',
  body          JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  sort_order    INT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published')),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX projects_status_sort_order_idx
  ON projects (status, sort_order);

-- Singleton-style site content (about page, future site meta / social links).
CREATE TABLE site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action     TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_log_created_at_idx ON audit_log (created_at DESC);
