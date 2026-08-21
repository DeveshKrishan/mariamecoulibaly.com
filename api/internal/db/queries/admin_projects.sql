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
  title = $2,
  client = $3,
  role = $4,
  summary = $5,
  body = $6,
  thumbnail_url = $7,
  sort_order = $8,
  status = $9,
  published_at = $10,
  updated_by_email = $11,
  updated_by_display_name = $12,
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
