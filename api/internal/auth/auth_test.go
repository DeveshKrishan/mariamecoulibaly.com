package auth

import (
	"net/http"
	"testing"
)

func TestBearerToken(t *testing.T) {
	req := httptestRequest("Bearer abc.def.ghi")
	if got := BearerToken(req); got != "abc.def.ghi" {
		t.Fatalf("BearerToken = %q", got)
	}
	if got := BearerToken(httptestRequest("")); got != "" {
		t.Fatalf("empty = %q", got)
	}
	if got := BearerToken(httptestRequest("Token nope")); got != "" {
		t.Fatalf("non-bearer = %q", got)
	}
}

func httptestRequest(authHeader string) *http.Request {
	req, _ := http.NewRequest(http.MethodGet, "/", nil)
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}
	return req
}

func TestNewJWKSVerifierRequiresConfig(t *testing.T) {
	if _, err := NewJWKSVerifier("", []string{"a@b.com"}); err == nil {
		t.Fatal("expected error for empty supabase URL")
	}
	if _, err := NewJWKSVerifier("https://x.supabase.co", nil); err == nil {
		t.Fatal("expected error for empty allowlist")
	}
}
