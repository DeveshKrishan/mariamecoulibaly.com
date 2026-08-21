// Package auth verifies Supabase Auth access tokens and enforces the admin allowlist.
package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
)

// ErrUnauthorized is returned when the Bearer token is missing or invalid.
var ErrUnauthorized = errors.New("unauthorized")

// ErrForbidden is returned when the token is valid but the email is not allowlisted.
var ErrForbidden = errors.New("forbidden")

// User is the authenticated admin identity attached to a request.
type User struct {
	ID          string
	Email       string
	DisplayName string
}

type contextKey struct{}

// WithUser stores the admin user on the request context.
func WithUser(ctx context.Context, u *User) context.Context {
	return context.WithValue(ctx, contextKey{}, u)
}

// UserFromContext returns the admin user, or nil if absent.
func UserFromContext(ctx context.Context) *User {
	u, _ := ctx.Value(contextKey{}).(*User)
	return u
}

// Verifier validates Supabase access tokens and checks the email allowlist.
type Verifier interface {
	Authenticate(ctx context.Context, bearerToken string) (*User, error)
}

// JWKSVerifier verifies ES256/RS256 Supabase JWTs via the project's JWKS endpoint.
type JWKSVerifier struct {
	issuer    string
	jwksURL   string
	allowlist map[string]struct{}

	mu     sync.Mutex
	cache  jwk.Set
	expiry time.Time
}

// NewJWKSVerifier builds a verifier for the given Supabase project URL and admin emails.
func NewJWKSVerifier(supabaseURL string, adminEmails []string) (*JWKSVerifier, error) {
	base := strings.TrimRight(strings.TrimSpace(supabaseURL), "/")
	if base == "" {
		return nil, fmt.Errorf("auth: supabase URL is required")
	}
	allow := make(map[string]struct{}, len(adminEmails))
	for _, e := range adminEmails {
		e = strings.ToLower(strings.TrimSpace(e))
		if e != "" {
			allow[e] = struct{}{}
		}
	}
	if len(allow) == 0 {
		return nil, fmt.Errorf("auth: at least one admin email is required")
	}
	return &JWKSVerifier{
		issuer:    base + "/auth/v1",
		jwksURL:   base + "/auth/v1/.well-known/jwks.json",
		allowlist: allow,
	}, nil
}

// Authenticate verifies the JWT and returns the allowlisted user.
func (v *JWKSVerifier) Authenticate(ctx context.Context, rawToken string) (*User, error) {
	rawToken = strings.TrimSpace(rawToken)
	if rawToken == "" {
		return nil, ErrUnauthorized
	}

	set, err := v.keySet(ctx)
	if err != nil {
		return nil, fmt.Errorf("%w: fetch jwks: %w", ErrUnauthorized, err)
	}

	token, err := jwt.Parse(
		[]byte(rawToken),
		jwt.WithKeySet(set),
		jwt.WithValidate(true),
		jwt.WithIssuer(v.issuer),
	)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrUnauthorized, err)
	}

	var role string
	_ = token.Get("role", &role)
	if role != "" && role != "authenticated" {
		return nil, ErrUnauthorized
	}

	var email string
	_ = token.Get("email", &email)
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return nil, ErrUnauthorized
	}
	if _, ok := v.allowlist[email]; !ok {
		return nil, ErrForbidden
	}

	sub, _ := token.Subject()
	display := displayNameFromToken(token)
	if display == "" {
		display = email
	}

	return &User{
		ID:          sub,
		Email:       email,
		DisplayName: display,
	}, nil
}

func displayNameFromToken(token jwt.Token) string {
	var meta map[string]any
	if err := token.Get("user_metadata", &meta); err == nil && meta != nil {
		for _, key := range []string{"full_name", "name"} {
			if v, ok := meta[key].(string); ok && strings.TrimSpace(v) != "" {
				return strings.TrimSpace(v)
			}
		}
	}
	var name string
	_ = token.Get("name", &name)
	return strings.TrimSpace(name)
}

func (v *JWKSVerifier) keySet(ctx context.Context) (jwk.Set, error) {
	v.mu.Lock()
	defer v.mu.Unlock()

	if v.cache != nil && time.Now().Before(v.expiry) {
		return v.cache, nil
	}

	set, err := jwk.Fetch(ctx, v.jwksURL)
	if err != nil {
		if v.cache != nil {
			// Soft-fail to stale cache briefly if Auth is unreachable.
			return v.cache, nil
		}
		return nil, err
	}
	v.cache = set
	// JWKS is edge-cached ~10m; keep local cache shorter so rotations propagate.
	v.expiry = time.Now().Add(5 * time.Minute)
	return set, nil
}

// BearerToken extracts the access token from an Authorization header.
func BearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if h == "" {
		return ""
	}
	const prefix = "Bearer "
	if len(h) < len(prefix) || !strings.EqualFold(h[:len(prefix)], prefix) {
		return ""
	}
	return strings.TrimSpace(h[len(prefix):])
}

// StaticVerifier is a test double that maps a raw token string to a User.
type StaticVerifier struct {
	Users map[string]*User // token -> user; missing token => Unauthorized
	// ForbiddenTokens are valid-looking tokens that fail the allowlist.
	ForbiddenTokens map[string]struct{}
}

// Authenticate implements Verifier.
func (s *StaticVerifier) Authenticate(_ context.Context, token string) (*User, error) {
	token = strings.TrimSpace(token)
	if token == "" {
		return nil, ErrUnauthorized
	}
	if _, ok := s.ForbiddenTokens[token]; ok {
		return nil, ErrForbidden
	}
	u, ok := s.Users[token]
	if !ok || u == nil {
		return nil, ErrUnauthorized
	}
	return u, nil
}
