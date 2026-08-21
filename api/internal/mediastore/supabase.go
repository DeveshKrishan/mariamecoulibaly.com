// Package mediastore talks to Supabase Storage (S3-compatible) for signed
// uploads and object deletes used by admin thumbnail replace.
package mediastore

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultBucket = "project-media"

// Client mints signed upload URLs and deletes objects in a Supabase bucket.
type Client struct {
	baseURL    string // e.g. https://<ref>.supabase.co
	serviceKey string
	bucket     string
	http       *http.Client
}

// Config is the subset of app config needed to build a Client.
type Config struct {
	SupabaseURL    string
	ServiceRoleKey string
	StorageBucket  string
	HTTPClient     *http.Client
}

// New builds a Client. Returns nil when URL or service role key is missing
// (upload routes should respond 503 until configured).
func New(cfg Config) *Client {
	base := strings.TrimRight(strings.TrimSpace(cfg.SupabaseURL), "/")
	key := strings.TrimSpace(cfg.ServiceRoleKey)
	if base == "" || key == "" {
		return nil
	}
	bucket := strings.TrimSpace(cfg.StorageBucket)
	if bucket == "" {
		bucket = defaultBucket
	}
	hc := cfg.HTTPClient
	if hc == nil {
		hc = &http.Client{Timeout: 15 * time.Second}
	}
	return &Client{
		baseURL:    base,
		serviceKey: key,
		bucket:     bucket,
		http:       hc,
	}
}

// Bucket returns the configured storage bucket name.
func (c *Client) Bucket() string {
	if c == nil {
		return defaultBucket
	}
	return c.bucket
}

// PublicURL returns the permanent public object URL for objectKey.
func (c *Client) PublicURL(objectKey string) string {
	key := strings.TrimLeft(objectKey, "/")
	return fmt.Sprintf("%s/storage/v1/object/public/%s/%s", c.baseURL, c.bucket, key)
}

// ObjectKeyFromPublicURL extracts the object key when url is under this
// client's public bucket prefix. Local paths like /images/... return false.
func (c *Client) ObjectKeyFromPublicURL(raw string) (string, bool) {
	if c == nil || raw == "" {
		return "", false
	}
	prefix := fmt.Sprintf("%s/storage/v1/object/public/%s/", c.baseURL, c.bucket)
	if !strings.HasPrefix(raw, prefix) {
		return "", false
	}
	key := strings.TrimPrefix(raw, prefix)
	if key == "" || strings.Contains(key, "..") {
		return "", false
	}
	return key, true
}

type signedUploadResponse struct {
	URL   string `json:"url"`
	Token string `json:"token"`
}

// CreateSignedUploadURL asks Storage for a short-lived PUT URL for objectKey.
func (c *Client) CreateSignedUploadURL(ctx context.Context, objectKey string) (uploadURL string, err error) {
	if c == nil {
		return "", fmt.Errorf("mediastore: client not configured")
	}
	key := strings.TrimLeft(objectKey, "/")
	endpoint := fmt.Sprintf("%s/storage/v1/object/upload/sign/%s/%s", c.baseURL, c.bucket, key)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader([]byte("{}")))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+c.serviceKey)
	req.Header.Set("apikey", c.serviceKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return "", fmt.Errorf("mediastore: sign upload: %w", err)
	}
	defer func() { _ = res.Body.Close() }()
	body, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("mediastore: sign upload: status %d: %s", res.StatusCode, strings.TrimSpace(string(body)))
	}

	var parsed signedUploadResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return "", fmt.Errorf("mediastore: decode sign response: %w", err)
	}
	if parsed.URL == "" {
		return "", fmt.Errorf("mediastore: sign response missing url")
	}

	// API returns a path like /object/upload/sign/...?token=...
	abs, err := url.Parse(c.baseURL + "/storage/v1" + parsed.URL)
	if err != nil {
		return "", fmt.Errorf("mediastore: parse signed url: %w", err)
	}
	return abs.String(), nil
}

// DeleteObjectBestEffort removes an object; errors are returned for logging
// but callers should not fail the user-facing request.
func (c *Client) DeleteObjectBestEffort(ctx context.Context, objectKey string) error {
	if c == nil {
		return fmt.Errorf("mediastore: client not configured")
	}
	key := strings.TrimLeft(objectKey, "/")
	endpoint := fmt.Sprintf("%s/storage/v1/object/%s", c.baseURL, c.bucket)

	payload, err := json.Marshal(map[string][]string{"prefixes": {key}})
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, endpoint, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.serviceKey)
	req.Header.Set("apikey", c.serviceKey)
	req.Header.Set("Content-Type", "application/json")

	res, err := c.http.Do(req)
	if err != nil {
		return fmt.Errorf("mediastore: delete: %w", err)
	}
	defer func() { _ = res.Body.Close() }()
	body, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("mediastore: delete: status %d: %s", res.StatusCode, strings.TrimSpace(string(body)))
	}
	return nil
}
