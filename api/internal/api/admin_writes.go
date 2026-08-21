package api

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/auth"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

type projectWriteBody struct {
	Slug         string                 `json:"slug"`
	Title        string                 `json:"title"`
	Client       string                 `json:"client"`
	Role         string                 `json:"role"`
	Summary      string                 `json:"summary"`
	Body         []models.RichTextBlock `json:"body"`
	ThumbnailURL string                 `json:"thumbnailUrl"`
	SortOrder    int                    `json:"sortOrder"`
	Status       models.ContentStatus   `json:"status"`
	PublishedAt  string                 `json:"publishedAt"`
}

type reorderBody struct {
	Slugs []string `json:"slugs"`
}

func (s *Server) handleListAdminProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := s.store.ListAdminProjects(r.Context())
	if err != nil {
		log.Printf("list admin projects: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, projects)
}

func (s *Server) handleGetAdminProject(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	project, err := s.store.GetAdminProjectBySlug(r.Context(), slug)
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		return
	}
	if err != nil {
		log.Printf("get admin project %q: %v", slug, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, project)
}

func (s *Server) handleCreateProject(w http.ResponseWriter, r *http.Request) {
	actor, ok := requireActor(w, r)
	if !ok {
		return
	}

	var body projectWriteBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	in, errMsg := validateProjectInput(body, true)
	if errMsg != "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": errMsg})
		return
	}

	project, err := s.store.CreateProject(r.Context(), actor, in)
	if errors.Is(err, store.ErrReadOnly) {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database required for writes"})
		return
	}
	if errors.Is(err, store.ErrConflict) {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "slug already exists"})
		return
	}
	if err != nil {
		log.Printf("create project: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusCreated, project)
}

func (s *Server) handleUpdateProject(w http.ResponseWriter, r *http.Request) {
	actor, ok := requireActor(w, r)
	if !ok {
		return
	}
	slug := chi.URLParam(r, "slug")

	var body projectWriteBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	body.Slug = slug
	in, errMsg := validateProjectInput(body, false)
	if errMsg != "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": errMsg})
		return
	}

	project, err := s.store.UpdateProject(r.Context(), actor, slug, in)
	if errors.Is(err, store.ErrReadOnly) {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database required for writes"})
		return
	}
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		return
	}
	if err != nil {
		log.Printf("update project %q: %v", slug, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, project)
}

func (s *Server) handleDeleteProject(w http.ResponseWriter, r *http.Request) {
	actor, ok := requireActor(w, r)
	if !ok {
		return
	}
	slug := chi.URLParam(r, "slug")

	err := s.store.SoftDeleteProject(r.Context(), actor, slug)
	if errors.Is(err, store.ErrReadOnly) {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database required for writes"})
		return
	}
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		return
	}
	if err != nil {
		log.Printf("delete project %q: %v", slug, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleReorderProjects(w http.ResponseWriter, r *http.Request) {
	actor, ok := requireActor(w, r)
	if !ok {
		return
	}

	var body reorderBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	if len(body.Slugs) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "slugs is required"})
		return
	}
	seen := make(map[string]struct{}, len(body.Slugs))
	for _, slug := range body.Slugs {
		if !slugPattern.MatchString(slug) {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid slug in list"})
			return
		}
		if _, ok := seen[slug]; ok {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "duplicate slug in list"})
			return
		}
		seen[slug] = struct{}{}
	}

	err := s.store.ReorderProjects(r.Context(), actor, body.Slugs)
	if errors.Is(err, store.ErrReadOnly) {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database required for writes"})
		return
	}
	if err != nil {
		log.Printf("reorder projects: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) handleUpdateAboutPage(w http.ResponseWriter, r *http.Request) {
	actor, ok := requireActor(w, r)
	if !ok {
		return
	}

	var page models.AboutPage
	if err := json.NewDecoder(r.Body).Decode(&page); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
		return
	}
	if strings.TrimSpace(page.Title) == "" || strings.TrimSpace(page.Headline) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "title and headline are required"})
		return
	}
	if page.Links == nil {
		page.Links = []models.AboutPageLink{}
	}

	out, err := s.store.UpdateAboutPage(r.Context(), actor, page)
	if errors.Is(err, store.ErrReadOnly) {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database required for writes"})
		return
	}
	if err != nil {
		log.Printf("update about page: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, out)
}

func requireActor(w http.ResponseWriter, r *http.Request) (store.Actor, bool) {
	user := auth.UserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return store.Actor{}, false
	}
	return store.Actor{Email: user.Email, DisplayName: user.DisplayName}, true
}

func validateProjectInput(body projectWriteBody, requireSlug bool) (store.ProjectInput, string) {
	slug := strings.TrimSpace(body.Slug)
	title := strings.TrimSpace(body.Title)
	if requireSlug {
		if slug == "" {
			return store.ProjectInput{}, "slug is required"
		}
		if !slugPattern.MatchString(slug) {
			return store.ProjectInput{}, "slug must be lowercase letters, numbers, and hyphens"
		}
	}
	if title == "" {
		return store.ProjectInput{}, "title is required"
	}
	status := body.Status
	if status == "" {
		status = models.StatusDraft
	}
	if status != models.StatusDraft && status != models.StatusPublished {
		return store.ProjectInput{}, "status must be draft or published"
	}
	bodyBlocks := body.Body
	if bodyBlocks == nil {
		bodyBlocks = []models.RichTextBlock{}
	}
	return store.ProjectInput{
		Slug:         slug,
		Title:        title,
		Client:       body.Client,
		Role:         body.Role,
		Summary:      body.Summary,
		Body:         bodyBlocks,
		ThumbnailURL: body.ThumbnailURL,
		SortOrder:    body.SortOrder,
		Status:       status,
		PublishedAt:  strings.TrimSpace(body.PublishedAt),
	}, ""
}
