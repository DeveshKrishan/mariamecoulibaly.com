-- Edit-mode support: soft delete and editor attribution on projects.
-- Uploaded-image assets (media table) deferred until image upload is built.
-- Videos stay as external embed/link URLs in projects.body.

ALTER TABLE projects
  ADD COLUMN deleted_at TIMESTAMPTZ,
  ADD COLUMN created_by_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN created_by_display_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN updated_by_email TEXT NOT NULL DEFAULT '',
  ADD COLUMN updated_by_display_name TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN projects.deleted_at IS
  'When set, project is soft-deleted (hidden from public + default admin lists; recoverable)';
COMMENT ON COLUMN projects.created_by_email IS
  'Admin email that created the project';
COMMENT ON COLUMN projects.created_by_display_name IS
  'Admin display name that created the project';
COMMENT ON COLUMN projects.updated_by_email IS
  'Admin email that last updated the project';
COMMENT ON COLUMN projects.updated_by_display_name IS
  'Admin display name that last updated the project';

-- Allow recreating a slug after soft-delete (unique only among active rows).
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_slug_key;
CREATE UNIQUE INDEX projects_slug_active_uidx
  ON projects (slug)
  WHERE deleted_at IS NULL;

CREATE INDEX projects_deleted_at_idx ON projects (deleted_at);
