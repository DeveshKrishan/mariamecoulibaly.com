// Package store loads portfolio content for the public API.
//
// When API_DATABASE_URL (or DATABASE_URL) is set, handlers read from Postgres
// via sqlc-generated queries. Otherwise they fall back to the in-memory stub
// data that was migrated from the Squarespace site (Phase 1).
package store

import (
	"context"
	"errors"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// ErrNotFound is returned when a project slug or site setting key is missing.
var ErrNotFound = errors.New("not found")

// Store is the content backend used by public GET handlers.
type Store interface {
	ListProjects(ctx context.Context) ([]models.Project, error)
	GetProjectBySlug(ctx context.Context, slug string) (*models.Project, error)
	GetAboutPage(ctx context.Context) (*models.AboutPage, error)
}

// Seeder can upsert the Phase 1 stub content into Postgres.
type Seeder interface {
	Seed(ctx context.Context) error
}

// AboutPageSettingKey is the site_settings.key for the About Me singleton.
const AboutPageSettingKey = "about_page"
