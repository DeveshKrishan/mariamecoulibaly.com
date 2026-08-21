package api_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/api"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/auth"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

func TestMediaUploadURLRequiresAuth(t *testing.T) {
	handler := api.NewRouter(&config.Config{CORSOrigin: "http://localhost:5173"}, store.NewMemory(), &auth.StaticVerifier{})
	req := httptest.NewRequest(http.MethodPost, "/api/admin/media/upload-url", strings.NewReader(`{}`))
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want 401", rec.Code)
	}
}

func TestMediaUploadURLRequiresStorageConfig(t *testing.T) {
	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{"tok": {Email: "admin@example.com", DisplayName: "Admin"}},
	}
	handler := api.NewRouter(&config.Config{
		CORSOrigin:  "http://localhost:5173",
		SupabaseURL: "https://example.supabase.co",
	}, store.NewMemory(), verifier)

	payload := []byte(`{"projectId":"1","contentType":"image/jpeg","byteSize":1024}`)
	req := httptest.NewRequest(http.MethodPost, "/api/admin/media/upload-url", bytes.NewReader(payload))
	req.Header.Set("Authorization", "Bearer tok")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want 503", rec.Code)
	}
}

func TestMediaUploadURLRejectsBadTypeAndSize(t *testing.T) {
	storage := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		t.Fatal("storage should not be called for invalid requests")
	}))
	t.Cleanup(storage.Close)

	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{"tok": {Email: "admin@example.com", DisplayName: "Admin"}},
	}
	handler := api.NewRouter(&config.Config{
		CORSOrigin:             "http://localhost:5173",
		SupabaseURL:            storage.URL,
		SupabaseServiceRoleKey: "secret",
		StorageBucket:          "project-media",
	}, store.NewMemory(), verifier)

	cases := []struct {
		name string
		body string
	}{
		{"bad mime", `{"projectId":"1","contentType":"image/gif","byteSize":10}`},
		{"too big", `{"projectId":"1","contentType":"image/png","byteSize":20971521}`},
		{"missing project", `{"contentType":"image/png","byteSize":10}`},
		{"unknown project", `{"projectId":"missing","contentType":"image/png","byteSize":10}`},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/api/admin/media/upload-url", strings.NewReader(tc.body))
			req.Header.Set("Authorization", "Bearer tok")
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			handler.ServeHTTP(rec, req)
			if rec.Code == http.StatusOK || rec.Code == http.StatusServiceUnavailable {
				t.Fatalf("status = %d, want 4xx", rec.Code)
			}
		})
	}
}

func TestMediaUploadURLOK(t *testing.T) {
	storage := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/storage/v1/object/upload/sign/project-media/projects/1/") {
			t.Fatalf("unexpected path %s", r.URL.Path)
		}
		_ = json.NewEncoder(w).Encode(map[string]string{
			"url":   "/object/upload/sign/project-media/projects/1/x.jpg?token=abc",
			"token": "abc",
		})
	}))
	t.Cleanup(storage.Close)

	verifier := &auth.StaticVerifier{
		Users: map[string]*auth.User{"tok": {Email: "admin@example.com", DisplayName: "Admin"}},
	}
	handler := api.NewRouter(&config.Config{
		CORSOrigin:             "http://localhost:5173",
		SupabaseURL:            storage.URL,
		SupabaseServiceRoleKey: "secret",
		StorageBucket:          "project-media",
	}, store.NewMemory(), verifier)

	payload := []byte(`{"projectId":"1","contentType":"image/jpeg","byteSize":2048}`)
	req := httptest.NewRequest(http.MethodPost, "/api/admin/media/upload-url", bytes.NewReader(payload))
	req.Header.Set("Authorization", "Bearer tok")
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d body=%s", rec.Code, rec.Body.String())
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatal(err)
	}
	if body["objectKey"] == "" || !strings.HasPrefix(body["objectKey"], "projects/1/") {
		t.Fatalf("objectKey = %q", body["objectKey"])
	}
	if !strings.Contains(body["uploadUrl"], "token=abc") {
		t.Fatalf("uploadUrl = %q", body["uploadUrl"])
	}
	if !strings.Contains(body["publicUrl"], "/object/public/project-media/") {
		t.Fatalf("publicUrl = %q", body["publicUrl"])
	}
}
