// Package api wires up HTTP handlers for the public content endpoints
// described in docs/PLAN.md (Section 4, Architecture Overview).
package api

import (
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
)

// NewRouter builds the HTTP handler for the API, wiring routes and
// CORS middleware according to the given configuration.
func NewRouter(cfg *config.Config) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handleHealth)
	mux.HandleFunc("GET /api/projects", handleListProjects)
	mux.HandleFunc("GET /api/projects/{slug}", handleGetProject)
	mux.HandleFunc("GET /api/pages/about", handleGetAboutPage)

	return withCORS(cfg.CORSOrigin)(mux)
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
