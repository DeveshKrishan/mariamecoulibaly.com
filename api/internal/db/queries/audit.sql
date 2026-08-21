-- name: InsertAuditLog :one
INSERT INTO audit_log (user_email, user_display_name, action, payload)
VALUES ($1, $2, $3, $4)
RETURNING id, user_email, user_display_name, action, payload, created_at;
