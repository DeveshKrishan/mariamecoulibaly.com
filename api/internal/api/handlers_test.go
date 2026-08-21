package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/api"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/auth"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/models"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

func testRouter(verifier auth.Verifier) http.Handler {
	return api.NewRouter(&config.Config{CORSOrigin: "http://localhost:5173"}, store.NewMemory(), verifier)
}

func TestListProjectsUsesStore(t *testing.T) {
	handler := testRouter(nil)
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
	handler := testRouter(nil)
	req := httptest.NewRequest(http.MethodGet, "/api/projects/does-not-exist", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", rec.Code)
	}
}

func TestGetAboutPage(t *testing.T) {
	handler := testRouter(nil)
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

func TestAdminMeUnauthorizedWithoutToken(t *testing.T) {
	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{
			"good-token": {Email: "admin@example.com", DisplayName: "Admin"},
		},
	}
	handler := testRouter(verifier)
	req := httptest.NewRequest(http.MethodGet, "/api/admin/me", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}

func TestAdminMeForbiddenWhenNotAllowlisted(t *testing.T) {
	verifier := &auth.StaticVerifier{
		ForbiddenTokens: map[string]struct{}{"bad-email-token": {}},
	}
	handler := testRouter(verifier)
	req := httptest.NewRequest(http.MethodGet, "/api/admin/me", nil)
	req.Header.Set("Authorization", "Bearer bad-email-token")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusForbidden {
		t.Fatalf("status = %d, want 403", rec.Code)
	}
}

func TestAdminMeOK(t *testing.T) {
	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{
			"good-token": {Email: "admin@example.com", DisplayName: "Admin"},
		},
	}
	handler := testRouter(verifier)
	req := httptest.NewRequest(http.MethodGet, "/api/admin/me", nil)
	req.Header.Set("Authorization", "Bearer good-token")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if body["email"] != "admin@example.com" {
		t.Fatalf("email = %q", body["email"])
	}
}

func TestCreateProjectRequiresDatabase(t *testing.T) {
	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{
			"good-token": {Email: "admin@example.com", DisplayName: "Admin"},
		},
	}
	handler := testRouter(verifier)
	payload := []byte(`{"slug":"new-work","title":"New Work","status":"draft"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewReader(payload))
	req.Header.Set("Authorization", "Bearer good-token")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want 503", rec.Code)
	}
}

func TestCreateProjectUnauthorized(t *testing.T) {
	handler := testRouter(&auth.StaticVerifier{Users: map[string]*auth.User{}})
	payload := []byte(`{"slug":"new-work","title":"New Work"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/projects", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}
