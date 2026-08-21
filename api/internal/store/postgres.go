package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/db"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// Postgres reads and seeds content via sqlc + pgx.
type Postgres struct {
	pool    *pgxpool.Pool
	queries *db.Queries
}

// NewPostgres wraps a pgx pool with the sqlc query layer.
func NewPostgres(pool *pgxpool.Pool) *Postgres {
	return &Postgres{pool: pool, queries: db.New(pool)}
}

// ListProjects returns published projects ordered by sort_order.
func (p *Postgres) ListProjects(ctx context.Context) ([]models.Project, error) {
	rows, err := p.queries.ListPublishedProjects(ctx)
	if err != nil {
		return nil, fmt.Errorf("list projects: %w", err)
	}
	out := make([]models.Project, 0, len(rows))
	for _, row := range rows {
		project, err := projectFromRow(row)
		if err != nil {
			return nil, err
		}
		out = append(out, project)
	}
	return out, nil
}

// GetProjectBySlug returns a published project by slug, or ErrNotFound.
func (p *Postgres) GetProjectBySlug(ctx context.Context, slug string) (*models.Project, error) {
	row, err := p.queries.GetPublishedProjectBySlug(ctx, slug)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get project %q: %w", slug, err)
	}
	project, err := projectFromRow(row)
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// GetAboutPage loads the about_page site setting.
func (p *Postgres) GetAboutPage(ctx context.Context) (*models.AboutPage, error) {
	row, err := p.queries.GetSiteSetting(ctx, AboutPageSettingKey)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get about page: %w", err)
	}
	var page models.AboutPage
	if err := json.Unmarshal(row.Value, &page); err != nil {
		return nil, fmt.Errorf("decode about page: %w", err)
	}
	return &page, nil
}

// Seed upserts stub projects and the about page into Postgres in one transaction.
func (p *Postgres) Seed(ctx context.Context) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin seed transaction: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck // rollback is a no-op after commit

	q := p.queries.WithTx(tx)
	for _, project := range stubProjects {
		body, err := json.Marshal(project.Body)
		if err != nil {
			return fmt.Errorf("encode body for %q: %w", project.Slug, err)
		}
		publishedAt, err := parsePublishedAt(project.PublishedAt)
		if err != nil {
			return fmt.Errorf("parse publishedAt for %q: %w", project.Slug, err)
		}
		_, err = q.UpsertProject(ctx, db.UpsertProjectParams{
			Slug:         project.Slug,
			Title:        project.Title,
			Client:       project.Client,
			Role:         project.Role,
			Summary:      project.Summary,
			Body:         body,
			ThumbnailUrl: project.ThumbnailURL,
			SortOrder:    int32(project.SortOrder),
			Status:       string(project.Status),
			PublishedAt:  publishedAt,
		})
		if err != nil {
			return fmt.Errorf("upsert project %q: %w", project.Slug, err)
		}
	}

	aboutJSON, err := json.Marshal(stubAboutPage)
	if err != nil {
		return fmt.Errorf("encode about page: %w", err)
	}
	_, err = q.UpsertSiteSetting(ctx, db.UpsertSiteSettingParams{
		Key:   AboutPageSettingKey,
		Value: aboutJSON,
	})
	if err != nil {
		return fmt.Errorf("upsert about page: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit seed transaction: %w", err)
	}
	return nil
}

func projectFromRow(row db.Project) (models.Project, error) {
	var body []models.RichTextBlock
	if len(row.Body) > 0 {
		if err := json.Unmarshal(row.Body, &body); err != nil {
			return models.Project{}, fmt.Errorf("decode body for %q: %w", row.Slug, err)
		}
	}
	if body == nil {
		body = []models.RichTextBlock{}
	}

	return models.Project{
		ID:           uuidString(row.ID),
		Slug:         row.Slug,
		Title:        row.Title,
		PublishedAt:  formatPublishedAt(row.PublishedAt),
		Client:       row.Client,
		Role:         row.Role,
		Summary:      row.Summary,
		Body:         body,
		ThumbnailURL: row.ThumbnailUrl,
		SortOrder:    int(row.SortOrder),
		Status:       models.ContentStatus(row.Status),
	}, nil
}

func uuidString(id pgtype.UUID) string {
	if !id.Valid {
		return ""
	}
	b := id.Bytes
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%02x%02x%02x%02x%02x%02x",
		uint32(b[0])<<24|uint32(b[1])<<16|uint32(b[2])<<8|uint32(b[3]),
		uint16(b[4])<<8|uint16(b[5]),
		uint16(b[6])<<8|uint16(b[7]),
		uint16(b[8])<<8|uint16(b[9]),
		b[10], b[11], b[12], b[13], b[14], b[15],
	)
}

func formatPublishedAt(ts pgtype.Timestamptz) string {
	if !ts.Valid {
		return ""
	}
	return ts.Time.UTC().Format("2006-01-02")
}

func parsePublishedAt(value string) (pgtype.Timestamptz, error) {
	if value == "" {
		return pgtype.Timestamptz{}, nil
	}
	formats := []string{
		"2006-01-02",
		time.RFC3339,
		time.RFC3339Nano,
		"2006-01-02T15:04:05Z07:00",
	}
	var lastErr error
	for _, layout := range formats {
		t, err := time.Parse(layout, value)
		if err == nil {
			return pgtype.Timestamptz{Time: t.UTC(), Valid: true}, nil
		}
		lastErr = err
	}
	return pgtype.Timestamptz{}, lastErr
}
