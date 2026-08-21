-- Public project media bucket for admin thumbnail (and later body image) uploads.
-- Writes go through signed upload URLs minted by the Go API with the service
-- role key (bypasses RLS). No anon/authenticated INSERT/UPDATE/DELETE policies.
-- See docs/PLAN.md §5.5 / §6.7.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-media',
  'project-media',
  true,
  20971520, -- 20 MiB (PLAN max image size)
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read so thumbnail URLs work for visitors without auth.
DROP POLICY IF EXISTS "Public read project-media" ON storage.objects;
CREATE POLICY "Public read project-media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'project-media');
