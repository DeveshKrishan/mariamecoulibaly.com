-- name: ListAdminProjects :many
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
WHERE deleted_at IS NULL
ORDER BY sort_order ASC;

-- name: GetAdminProjectBySlug :one
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
  AND deleted_at IS NULL;

-- name: InsertProject :one
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
  published_at,
  created_by_email,
  created_by_display_name,
  updated_by_email,
  updated_by_display_name
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
)
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

-- name: UpdateProjectBySlug :one
UPDATE projects SET
  slug = sqlc.arg(new_slug),
  title = sqlc.arg(title),
  client = sqlc.arg(client),
  role = sqlc.arg(role),
  summary = sqlc.arg(summary),
  body = sqlc.arg(body),
  thumbnail_url = sqlc.arg(thumbnail_url),
  sort_order = sqlc.arg(sort_order),
  status = sqlc.arg(status),
  published_at = sqlc.arg(published_at),
  updated_by_email = sqlc.arg(updated_by_email),
  updated_by_display_name = sqlc.arg(updated_by_display_name),
  updated_at = now()
WHERE slug = sqlc.arg(slug)
  AND deleted_at IS NULL
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

-- name: SoftDeleteProjectBySlug :one
UPDATE projects SET
  deleted_at = now(),
  updated_by_email = $2,
  updated_by_display_name = $3,
  updated_at = now()
WHERE slug = $1
  AND deleted_at IS NULL
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

-- name: UpdateProjectSortOrder :exec
UPDATE projects SET
  sort_order = $2,
  updated_by_email = $3,
  updated_by_display_name = $4,
  updated_at = now()
WHERE slug = $1
  AND deleted_at IS NULL;
