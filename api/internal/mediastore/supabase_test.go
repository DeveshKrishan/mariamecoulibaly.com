package mediastore

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestNewRequiresURLAndKey(t *testing.T) {
	if New(Config{}) != nil {
		t.Fatal("expected nil client without URL/key")
	}
	if New(Config{SupabaseURL: "https://x.supabase.co"}) != nil {
		t.Fatal("expected nil client without key")
	}
	c := New(Config{SupabaseURL: "https://x.supabase.co/", ServiceRoleKey: "secret"})
	if c == nil {
		t.Fatal("expected client")
	}
	if c.Bucket() != defaultBucket {
		t.Fatalf("bucket = %q", c.Bucket())
	}
	if got := c.PublicURL("projects/a/b.jpg"); got != "https://x.supabase.co/storage/v1/object/public/project-media/projects/a/b.jpg" {
		t.Fatalf("PublicURL = %q", got)
	}
}

func TestObjectKeyFromPublicURL(t *testing.T) {
	c := New(Config{SupabaseURL: "https://x.supabase.co", ServiceRoleKey: "secret"})
	key, ok := c.ObjectKeyFromPublicURL("https://x.supabase.co/storage/v1/object/public/project-media/projects/1/a.webp")
	if !ok || key != "projects/1/a.webp" {
		t.Fatalf("got %q ok=%v", key, ok)
	}
	if _, ok := c.ObjectKeyFromPublicURL("/images/projects/a.jpg"); ok {
		t.Fatal("local path should not parse")
	}
}

func TestCreateSignedUploadURL(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s", r.Method)
		}
		if r.URL.Path != "/storage/v1/object/upload/sign/project-media/projects/1/x.jpg" {
			t.Fatalf("path = %s", r.URL.Path)
		}
		if r.Header.Get("Authorization") != "Bearer secret" {
			t.Fatalf("auth = %q", r.Header.Get("Authorization"))
		}
		_ = json.NewEncoder(w).Encode(signedUploadResponse{
			URL:   "/object/upload/sign/project-media/projects/1/x.jpg?token=abc",
			Token: "abc",
		})
	}))
	t.Cleanup(srv.Close)

	c := New(Config{
		SupabaseURL:    srv.URL,
		ServiceRoleKey: "secret",
		HTTPClient:     srv.Client(),
	})
	uploadURL, err := c.CreateSignedUploadURL(context.Background(), "projects/1/x.jpg")
	if err != nil {
		t.Fatal(err)
	}
	want := srv.URL + "/storage/v1/object/upload/sign/project-media/projects/1/x.jpg?token=abc"
	if uploadURL != want {
		t.Fatalf("uploadURL = %q, want %q", uploadURL, want)
	}
}

func TestUploadObject(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s", r.Method)
		}
		if r.URL.Path != "/storage/v1/object/project-media/projects/1/seed.jpg" {
			t.Fatalf("path = %s", r.URL.Path)
		}
		if r.Header.Get("x-upsert") != "true" {
			t.Fatal("expected x-upsert")
		}
		if r.Header.Get("Content-Type") != "image/jpeg" {
			t.Fatalf("content-type = %q", r.Header.Get("Content-Type"))
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"Key":"project-media/projects/1/seed.jpg"}`))
	}))
	t.Cleanup(srv.Close)

	c := New(Config{
		SupabaseURL:    srv.URL,
		ServiceRoleKey: "secret",
		HTTPClient:     srv.Client(),
	})
	if err := c.UploadObject(context.Background(), "projects/1/seed.jpg", "image/jpeg", []byte("img")); err != nil {
		t.Fatal(err)
	}
}

func TestDeleteObjectBestEffort(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			t.Fatalf("method = %s", r.Method)
		}
		var body struct {
			Prefixes []string `json:"prefixes"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if len(body.Prefixes) != 1 || body.Prefixes[0] != "projects/1/old.jpg" {
			t.Fatalf("prefixes = %#v", body.Prefixes)
		}
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("[]"))
	}))
	t.Cleanup(srv.Close)

	c := New(Config{
		SupabaseURL:    srv.URL,
		ServiceRoleKey: "secret",
		HTTPClient:     srv.Client(),
	})
	if err := c.DeleteObjectBestEffort(context.Background(), "projects/1/old.jpg"); err != nil {
		t.Fatal(err)
	}
}
