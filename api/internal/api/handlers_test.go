package api_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/api"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

func TestListProjectsUsesStore(t *testing.T) {
	handler := api.NewRouter(&config.Config{CORSOrigin: "http://localhost:5173"}, store.NewMemory())
	req := httptest.NewRequest(http.MethodGet, "/api/projects", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var projects []models.Project
	if err := json.NewDecoder(rec.Body).Decode(&projects); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(projects) == 0 {
		t.Fatal("expected projects")
	}
}

func TestGetProjectNotFound(t *testing.T) {
	handler := api.NewRouter(&config.Config{CORSOrigin: "http://localhost:5173"}, store.NewMemory())
	req := httptest.NewRequest(http.MethodGet, "/api/projects/does-not-exist", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", rec.Code)
	}
}

func TestGetAboutPage(t *testing.T) {
	handler := api.NewRouter(&config.Config{CORSOrigin: "http://localhost:5173"}, store.NewMemory())
	req := httptest.NewRequest(http.MethodGet, "/api/pages/about", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var page models.AboutPage
	if err := json.NewDecoder(rec.Body).Decode(&page); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if page.Headline == "" {
		t.Fatal("expected headline")
	}
}
