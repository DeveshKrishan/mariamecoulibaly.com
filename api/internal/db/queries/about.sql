-- name: GetSiteSetting :one
SELECT key, value, updated_at
FROM site_settings
WHERE key = $1;

-- name: UpsertSiteSetting :one
INSERT INTO site_settings (key, value)
VALUES ($1, $2)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now()
RETURNING key, value, updated_at;
