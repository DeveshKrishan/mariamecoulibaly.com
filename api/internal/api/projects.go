package api

import (
	"errors"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

func (s *Server) handleListProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := s.store.ListProjects(r.Context())
	if err != nil {
		log.Printf("list projects: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, projects)
}

func (s *Server) handleGetProject(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	project, err := s.store.GetProjectBySlug(r.Context(), slug)
	if errors.Is(err, store.ErrNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "project not found"})
		return
	}
	if err != nil {
		log.Printf("get project %q: %v", slug, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
		return
	}
	writeJSON(w, http.StatusOK, project)
}
