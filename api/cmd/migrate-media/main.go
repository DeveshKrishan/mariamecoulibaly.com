// Command migrate-media uploads local seed thumbnails from
// ui/public/images/projects into Supabase Storage and rewrites
// projects.thumbnail_url to the public object URL.
//
// Requires:
//   - API_DATABASE_URL (or DATABASE_URL)
//   - API_SUPABASE_URL + API_SUPABASE_SERVICE_ROLE_KEY
//   - project-media bucket (see supabase migrations)
//
// Usage (from repo root):
//
//	make -C api migrate-media
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/mediastore"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

const localThumbPrefix = "/images/projects/"

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}
	if cfg.DatabaseURL == "" {
		return fmt.Errorf("API_DATABASE_URL (or DATABASE_URL) is required")
	}
	media := mediastore.New(mediastore.Config{
		SupabaseURL:    cfg.SupabaseURL,
		ServiceRoleKey: cfg.SupabaseServiceRoleKey,
		StorageBucket:  cfg.StorageBucket,
	})
	if media == nil {
		return fmt.Errorf("API_SUPABASE_URL and API_SUPABASE_SERVICE_ROLE_KEY are required")
	}

	imagesDir, err := resolveImagesDir()
	if err != nil {
		return err
	}
	log.Printf("images dir: %s", imagesDir)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connecting to database: %w", err)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("pinging database: %w", err)
	}

	pg := store.NewPostgres(pool)
	projects, err := pg.ListAdminProjects(ctx)
	if err != nil {
		return fmt.Errorf("list projects: %w", err)
	}

	actor := store.Actor{Email: "migrate-media@local", DisplayName: "migrate-media"}
	migrated := 0
	skipped := 0

	for _, project := range projects {
		if !strings.HasPrefix(project.ThumbnailURL, localThumbPrefix) {
			skipped++
			continue
		}
		rel := strings.TrimPrefix(project.ThumbnailURL, localThumbPrefix)
		rel = filepath.Base(rel) // never allow path traversal
		src := filepath.Join(imagesDir, rel)
		data, err := os.ReadFile(src)
		if err != nil {
			return fmt.Errorf("read %s (project %s): %w", src, project.Slug, err)
		}
		contentType, ext, err := imageTypeFromName(rel)
		if err != nil {
			return fmt.Errorf("project %s: %w", project.Slug, err)
		}
		objectKey := fmt.Sprintf("projects/%s/seed.%s", project.ID, ext)
		if err := media.UploadObject(ctx, objectKey, contentType, data); err != nil {
			return fmt.Errorf("upload %s: %w", project.Slug, err)
		}
		publicURL := media.PublicURL(objectKey)
		oldURL := project.ThumbnailURL
		in := store.ProjectInput{
			Slug:         project.Slug,
			Title:        project.Title,
			Client:       project.Client,
			Role:         project.Role,
			Summary:      project.Summary,
			Body:         project.Body,
			ThumbnailURL: publicURL,
			SortOrder:    project.SortOrder,
			Status:       project.Status,
			PublishedAt:  project.PublishedAt,
		}
		if _, err := pg.UpdateProject(ctx, actor, project.Slug, in); err != nil {
			return fmt.Errorf("update %s: %w", project.Slug, err)
		}
		payload, _ := json.Marshal(map[string]string{
			"projectId": project.ID,
			"slug":      project.Slug,
			"oldUrl":    oldURL,
			"newUrl":    publicURL,
		})
		if err := pg.LogAudit(ctx, actor, "media.migrate", payload); err != nil {
			log.Printf("audit media.migrate %s: %v", project.Slug, err)
		}
		log.Printf("migrated %s -> %s", project.Slug, publicURL)
		migrated++
	}

	log.Printf("done: migrated=%d skipped=%d", migrated, skipped)
	return nil
}

func resolveImagesDir() (string, error) {
	if v := strings.TrimSpace(os.Getenv("MIGRATE_MEDIA_IMAGES_DIR")); v != "" {
		return v, nil
	}
	candidates := []string{
		filepath.Join("..", "ui", "public", "images", "projects"),
		filepath.Join("ui", "public", "images", "projects"),
	}
	for _, c := range candidates {
		info, err := os.Stat(c)
		if err == nil && info.IsDir() {
			abs, err := filepath.Abs(c)
			if err != nil {
				return c, nil
			}
			return abs, nil
		}
	}
	return "", fmt.Errorf("could not find ui/public/images/projects (set MIGRATE_MEDIA_IMAGES_DIR)")
}

func imageTypeFromName(name string) (contentType, ext string, err error) {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".jpg", ".jpeg":
		return "image/jpeg", "jpg", nil
	case ".png":
		return "image/png", "png", nil
	case ".webp":
		return "image/webp", "webp", nil
	default:
		return "", "", fmt.Errorf("unsupported image extension in %q", name)
	}
}
