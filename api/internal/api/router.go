// Package api wires up HTTP handlers for the public content endpoints
// described in docs/PLAN.md (Section 4, Architecture Overview).
package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
)

// NewRouter builds the HTTP handler for the API, wiring routes and
// CORS middleware according to the given configuration.
func NewRouter(cfg *config.Config) http.Handler {
	r := chi.NewRouter()
	r.Use(withCORS(cfg.CORSOrigin))

	r.Get("/health", handleHealth)
	r.Get("/api/projects", handleListProjects)
	r.Get("/api/projects/{slug}", handleGetProject)
	r.Get("/api/pages/about", handleGetAboutPage)

	return r
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
