// Package api wires up HTTP handlers for the public content endpoints
// described in docs/PLAN.md (Section 4, Architecture Overview).
package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

// Server holds dependencies shared by HTTP handlers.
type Server struct {
	store store.Store
}

// NewRouter builds the HTTP handler for the API, wiring routes and
// CORS middleware according to the given configuration.
func NewRouter(cfg *config.Config, content store.Store) http.Handler {
	s := &Server{store: content}
	r := chi.NewRouter()
	r.Use(withCORS(cfg.CORSOrigin))

	r.Get("/health", handleHealth)
	r.Get("/api/projects", s.handleListProjects)
	r.Get("/api/projects/{slug}", s.handleGetProject)
	r.Get("/api/pages/about", s.handleGetAboutPage)

	return r
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
