package store

import (
	"context"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// Memory is the in-memory content store used when no database URL is configured.
type Memory struct{}

// NewMemory returns a Store backed by the migrated stub datasets.
func NewMemory() *Memory {
	return &Memory{}
}

// ListProjects returns published stub projects in sort order.
func (m *Memory) ListProjects(_ context.Context) ([]models.Project, error) {
	out := make([]models.Project, 0, len(stubProjects))
	for _, project := range stubProjects {
		if project.Status == models.StatusPublished {
			out = append(out, project)
		}
	}
	return out, nil
}

// GetProjectBySlug returns a published stub project or ErrNotFound.
func (m *Memory) GetProjectBySlug(_ context.Context, slug string) (*models.Project, error) {
	for i := range stubProjects {
		if stubProjects[i].Slug == slug && stubProjects[i].Status == models.StatusPublished {
			p := stubProjects[i]
			return &p, nil
		}
	}
	return nil, ErrNotFound
}

// GetAboutPage returns the stub About Me page.
func (m *Memory) GetAboutPage(_ context.Context) (*models.AboutPage, error) {
	page := stubAboutPage
	return &page, nil
}
