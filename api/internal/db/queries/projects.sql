-- name: ListPublishedProjects :many
SELECT
  id,
  slug,
  title,
  client,
  role,
  summary,
  body,
  thumbnail_url,
  sort_order,
  status,
  published_at,
  created_at,
  updated_at,
  deleted_at,
  created_by_email,
  created_by_display_name,
  updated_by_email,
  updated_by_display_name
FROM projects
WHERE status = 'published'
  AND deleted_at IS NULL
ORDER BY sort_order ASC;

-- name: GetPublishedProjectBySlug :one
SELECT
  id,
  slug,
  title,
  client,
  role,
  summary,
  body,
  thumbnail_url,
  sort_order,
  status,
  published_at,
  created_at,
  updated_at,
  deleted_at,
  created_by_email,
  created_by_display_name,
  updated_by_email,
  updated_by_display_name
FROM projects
WHERE slug = $1
  AND status = 'published'
  AND deleted_at IS NULL;

-- name: UpsertProject :one
INSERT INTO projects (
  slug,
  title,
  client,
  role,
  summary,
  body,
  thumbnail_url,
  sort_order,
  status,
  published_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
ON CONFLICT (slug) WHERE deleted_at IS NULL DO UPDATE SET
  title = EXCLUDED.title,
  client = EXCLUDED.client,
  role = EXCLUDED.role,
  summary = EXCLUDED.summary,
  body = EXCLUDED.body,
  thumbnail_url = EXCLUDED.thumbnail_url,
  sort_order = EXCLUDED.sort_order,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now()
RETURNING
  id,
  slug,
  title,
  client,
  role,
  summary,
  body,
  thumbnail_url,
  sort_order,
  status,
  published_at,
  created_at,
  updated_at,
  deleted_at,
  created_by_email,
  created_by_display_name,
  updated_by_email,
  updated_by_display_name;
