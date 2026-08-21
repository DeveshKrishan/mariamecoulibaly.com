-- Capture both identity fields on audit events (email + display name).
-- Applied after 20260820190000_init_schema on the linked project.

ALTER TABLE audit_log
  ADD COLUMN user_display_name TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN audit_log.user_email IS 'Authenticated admin email at the time of the action';
COMMENT ON COLUMN audit_log.user_display_name IS 'Authenticated admin display name at the time of the action';
