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

// ErrReadOnly is returned when an admin write is attempted against the memory store.
var ErrReadOnly = errors.New("store is read-only")

// ErrConflict is returned when creating or renaming a project to a slug that already exists.
var ErrConflict = errors.New("conflict")

// Actor is the admin performing a mutation (for attribution + audit).
type Actor struct {
	Email       string
	DisplayName string
}

// ProjectInput is the mutable fields for create/update.
type ProjectInput struct {
	Slug         string
	Title        string
	Client       string
	Role         string
	Summary      string
	Body         []models.RichTextBlock
	ThumbnailURL string
	SortOrder    int
	Status       models.ContentStatus
	PublishedAt  string // YYYY-MM-DD or empty
}

// Store is the content backend used by public GET handlers and admin writes.
type Store interface {
	ListProjects(ctx context.Context) ([]models.Project, error)
	GetProjectBySlug(ctx context.Context, slug string) (*models.Project, error)
	GetAboutPage(ctx context.Context) (*models.AboutPage, error)

	ListAdminProjects(ctx context.Context) ([]models.Project, error)
	GetAdminProjectBySlug(ctx context.Context, slug string) (*models.Project, error)
	CreateProject(ctx context.Context, actor Actor, in ProjectInput) (*models.Project, error)
	UpdateProject(ctx context.Context, actor Actor, slug string, in ProjectInput) (*models.Project, error)
	SoftDeleteProject(ctx context.Context, actor Actor, slug string) error
	ReorderProjects(ctx context.Context, actor Actor, slugs []string) error
	UpdateAboutPage(ctx context.Context, actor Actor, page models.AboutPage) (*models.AboutPage, error)
}

// Seeder can upsert the Phase 1 stub content into Postgres.
type Seeder interface {
	Seed(ctx context.Context) error
}

// AboutPageSettingKey is the site_settings.key for the About Me singleton.
const AboutPageSettingKey = "about_page"
