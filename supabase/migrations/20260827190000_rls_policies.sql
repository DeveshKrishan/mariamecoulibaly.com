-- Row-level security for PostgREST / Supabase client access (defense in depth).
--
-- The Go API connects with the postgres role (direct DATABASE_URL) and bypasses
-- RLS. Admin authorization (Supabase JWT + API_ADMIN_EMAILS allowlist) is
-- enforced in the API layer, not here. The UI Supabase client is auth-only;
-- content reads and writes go through /api/* routes.
--
-- anon / authenticated via PostgREST:
--   projects      — deny all (no policies; blocks drafts and published rows)
--   audit_log     — deny all (no policies; admin audit trail stays private)
--   site_settings — SELECT only (about-page content is public)
--
-- Storage read policy for project-media is in
-- 20260821231358_project_media_storage_bucket.sql.

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Replace manually-added duplicate policies with a single public-read policy.
DROP POLICY IF EXISTS "site_settings select authenticated" ON public.site_settings;
DROP POLICY IF EXISTS "site_settings select public" ON public.site_settings;

CREATE POLICY "site_settings select public"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);
