// Package api wires up HTTP handlers for the public content endpoints
// described in docs/PLAN.md (Section 4, Architecture Overview).
package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/auth"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/mediastore"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

// Server holds dependencies shared by HTTP handlers.
type Server struct {
	store store.Store
	auth  auth.Verifier
	media *mediastore.Client
}

// NewRouter builds the HTTP handler for the API, wiring routes and
// CORS middleware according to the given configuration.
//
// verifier may be nil; admin routes then return 503 until auth is configured.
func NewRouter(cfg *config.Config, content store.Store, verifier auth.Verifier) http.Handler {
	s := &Server{
		store: content,
		auth:  verifier,
		media: mediastore.New(mediastore.Config{
			SupabaseURL:    cfg.SupabaseURL,
			ServiceRoleKey: cfg.SupabaseServiceRoleKey,
			StorageBucket:  cfg.StorageBucket,
		}),
	}
	r := chi.NewRouter()
	r.Use(withCORS(cfg.CORSOrigin))

	r.Get("/health", handleHealth)
	r.Get("/api/projects", s.handleListProjects)
	r.Get("/api/projects/{slug}", s.handleGetProject)
	r.Get("/api/pages/about", s.handleGetAboutPage)

	r.Group(func(ar chi.Router) {
		ar.Use(s.requireAdmin)
		ar.Get("/api/admin/me", s.handleAdminMe)
		ar.Get("/api/admin/projects", s.handleListAdminProjects)
		ar.Get("/api/admin/projects/{slug}", s.handleGetAdminProject)
		ar.Post("/api/admin/media/upload-url", s.handleMediaUploadURL)
		ar.Post("/api/projects", s.handleCreateProject)
		ar.Patch("/api/projects/{slug}", s.handleUpdateProject)
		ar.Delete("/api/projects/{slug}", s.handleDeleteProject)
		ar.Put("/api/projects/reorder", s.handleReorderProjects)
		ar.Put("/api/pages/about", s.handleUpdateAboutPage)
	})

	return r
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
