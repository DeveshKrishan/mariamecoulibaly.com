package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/db"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
)

// ListAdminProjects returns all non-deleted projects (draft + published).
func (p *Postgres) ListAdminProjects(ctx context.Context) ([]models.Project, error) {
	rows, err := p.queries.ListAdminProjects(ctx)
	if err != nil {
		return nil, fmt.Errorf("list admin projects: %w", err)
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

// GetAdminProjectBySlug returns a non-deleted project by slug.
func (p *Postgres) GetAdminProjectBySlug(ctx context.Context, slug string) (*models.Project, error) {
	row, err := p.queries.GetAdminProjectBySlug(ctx, slug)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("get admin project %q: %w", slug, err)
	}
	project, err := projectFromRow(row)
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// CreateProject inserts a new project and writes an audit log entry.
func (p *Postgres) CreateProject(ctx context.Context, actor Actor, in ProjectInput) (*models.Project, error) {
	body, err := json.Marshal(in.Body)
	if err != nil {
		return nil, fmt.Errorf("encode body: %w", err)
	}
	publishedAt, err := parsePublishedAt(in.PublishedAt)
	if err != nil {
		return nil, fmt.Errorf("parse publishedAt: %w", err)
	}

	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin create project: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	q := p.queries.WithTx(tx)
	row, err := q.InsertProject(ctx, db.InsertProjectParams{
		Slug:                 in.Slug,
		Title:                in.Title,
		Client:               in.Client,
		Role:                 in.Role,
		Summary:              in.Summary,
		Body:                 body,
		ThumbnailUrl:         in.ThumbnailURL,
		SortOrder:            int32(in.SortOrder),
		Status:               string(in.Status),
		PublishedAt:          publishedAt,
		CreatedByEmail:       actor.Email,
		CreatedByDisplayName: actor.DisplayName,
		UpdatedByEmail:       actor.Email,
		UpdatedByDisplayName: actor.DisplayName,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrConflict
		}
		return nil, fmt.Errorf("insert project: %w", err)
	}

	payload, _ := json.Marshal(map[string]any{"slug": in.Slug})
	if _, err := q.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          "project.create",
		Payload:         payload,
	}); err != nil {
		return nil, fmt.Errorf("audit project.create: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit create project: %w", err)
	}

	project, err := projectFromRow(row)
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// UpdateProject updates a project by slug and writes an audit log entry.
func (p *Postgres) UpdateProject(ctx context.Context, actor Actor, slug string, in ProjectInput) (*models.Project, error) {
	body, err := json.Marshal(in.Body)
	if err != nil {
		return nil, fmt.Errorf("encode body: %w", err)
	}
	publishedAt, err := parsePublishedAt(in.PublishedAt)
	if err != nil {
		return nil, fmt.Errorf("parse publishedAt: %w", err)
	}

	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin update project: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	newSlug := in.Slug
	if newSlug == "" {
		newSlug = slug
	}

	q := p.queries.WithTx(tx)
	row, err := q.UpdateProjectBySlug(ctx, db.UpdateProjectBySlugParams{
		Slug:                 slug,
		NewSlug:              newSlug,
		Title:                in.Title,
		Client:               in.Client,
		Role:                 in.Role,
		Summary:              in.Summary,
		Body:                 body,
		ThumbnailUrl:         in.ThumbnailURL,
		SortOrder:            int32(in.SortOrder),
		Status:               string(in.Status),
		PublishedAt:          publishedAt,
		UpdatedByEmail:       actor.Email,
		UpdatedByDisplayName: actor.DisplayName,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrConflict
		}
		return nil, fmt.Errorf("update project %q: %w", slug, err)
	}

	payload, _ := json.Marshal(map[string]any{"slug": slug, "newSlug": newSlug})
	if _, err := q.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          "project.update",
		Payload:         payload,
	}); err != nil {
		return nil, fmt.Errorf("audit project.update: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit update project: %w", err)
	}

	project, err := projectFromRow(row)
	if err != nil {
		return nil, err
	}
	return &project, nil
}

// SoftDeleteProject marks a project deleted and writes an audit log entry.
func (p *Postgres) SoftDeleteProject(ctx context.Context, actor Actor, slug string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin soft delete: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	q := p.queries.WithTx(tx)
	_, err = q.SoftDeleteProjectBySlug(ctx, db.SoftDeleteProjectBySlugParams{
		Slug:                 slug,
		UpdatedByEmail:       actor.Email,
		UpdatedByDisplayName: actor.DisplayName,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("soft delete project %q: %w", slug, err)
	}

	payload, _ := json.Marshal(map[string]any{"slug": slug})
	if _, err := q.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          "project.delete",
		Payload:         payload,
	}); err != nil {
		return fmt.Errorf("audit project.delete: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit soft delete: %w", err)
	}
	return nil
}

// ReorderProjects assigns sort_order 0..n-1 from the given slug list.
func (p *Postgres) ReorderProjects(ctx context.Context, actor Actor, slugs []string) error {
	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin reorder: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	q := p.queries.WithTx(tx)
	for i, slug := range slugs {
		if err := q.UpdateProjectSortOrder(ctx, db.UpdateProjectSortOrderParams{
			Slug:                 slug,
			SortOrder:            int32(i),
			UpdatedByEmail:       actor.Email,
			UpdatedByDisplayName: actor.DisplayName,
		}); err != nil {
			return fmt.Errorf("reorder project %q: %w", slug, err)
		}
	}

	payload, _ := json.Marshal(map[string]any{"slugs": slugs})
	if _, err := q.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          "project.reorder",
		Payload:         payload,
	}); err != nil {
		return fmt.Errorf("audit project.reorder: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit reorder: %w", err)
	}
	return nil
}

// UpdateAboutPage upserts the about_page setting and writes an audit log entry.
func (p *Postgres) UpdateAboutPage(ctx context.Context, actor Actor, page models.AboutPage) (*models.AboutPage, error) {
	value, err := json.Marshal(page)
	if err != nil {
		return nil, fmt.Errorf("encode about page: %w", err)
	}

	tx, err := p.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin update about: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	q := p.queries.WithTx(tx)
	row, err := q.UpsertSiteSetting(ctx, db.UpsertSiteSettingParams{
		Key:   AboutPageSettingKey,
		Value: value,
	})
	if err != nil {
		return nil, fmt.Errorf("upsert about page: %w", err)
	}

	payload, _ := json.Marshal(map[string]any{"key": AboutPageSettingKey})
	if _, err := q.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          "about.update",
		Payload:         payload,
	}); err != nil {
		return nil, fmt.Errorf("audit about.update: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit update about: %w", err)
	}

	var out models.AboutPage
	if err := json.Unmarshal(row.Value, &out); err != nil {
		return nil, fmt.Errorf("decode about page: %w", err)
	}
	return &out, nil
}

// LogAudit inserts an audit_log row outside of a content mutation transaction.
func (p *Postgres) LogAudit(ctx context.Context, actor Actor, action string, payload []byte) error {
	if payload == nil {
		payload = []byte("{}")
	}
	if _, err := p.queries.InsertAuditLog(ctx, db.InsertAuditLogParams{
		UserEmail:       actor.Email,
		UserDisplayName: actor.DisplayName,
		Action:          action,
		Payload:         payload,
	}); err != nil {
		return fmt.Errorf("insert audit %q: %w", action, err)
	}
	return nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	// Fallback string match for wrapped drivers.
	return strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505")
}
