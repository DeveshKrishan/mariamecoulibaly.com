package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadDefaults(t *testing.T) {
	t.Setenv("API_DATABASE_URL", "")
	t.Setenv("DATABASE_URL", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != 4000 {
		t.Errorf("Port = %d, want 4000", cfg.Port)
	}
	if cfg.CORSOrigin != "http://localhost:5173" {
		t.Errorf("CORSOrigin = %q, want default", cfg.CORSOrigin)
	}
	if cfg.Env != "development" {
		t.Errorf("Env = %q, want %q", cfg.Env, "development")
	}
	if cfg.DatabaseURL != "" {
		t.Errorf("DatabaseURL = %q, want empty", cfg.DatabaseURL)
	}
}

func TestLoadEnvOverrides(t *testing.T) {
	t.Setenv("API_PORT", "8080")
	t.Setenv("API_CORS_ORIGIN", "https://example.com")
	t.Setenv("API_ENV", "production")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != 8080 {
		t.Errorf("Port = %d, want 8080", cfg.Port)
	}
	if cfg.CORSOrigin != "https://example.com" {
		t.Errorf("CORSOrigin = %q, want https://example.com", cfg.CORSOrigin)
	}
	if cfg.Env != "production" {
		t.Errorf("Env = %q, want production", cfg.Env)
	}
}

func TestLoadPortEnvOverridesAPIPort(t *testing.T) {
	// PaaS runtimes (Vercel, Railway, Render) assign the listen port via
	// the unprefixed PORT variable, which must win over API_PORT.
	t.Setenv("API_PORT", "8080")
	t.Setenv("PORT", "3000")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != 3000 {
		t.Errorf("Port = %d, want 3000 (PORT should override API_PORT)", cfg.Port)
	}
}

func TestLoadPortEnvInvalidValue(t *testing.T) {
	t.Setenv("PORT", "not-a-number")

	if _, err := Load(); err == nil {
		t.Fatal("Load() error = nil, want error for invalid PORT value")
	}
}

func writeTempConfigFile(t *testing.T, contents string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "app-config.yml")
	if err := os.WriteFile(path, []byte(contents), 0o600); err != nil {
		t.Fatalf("writing temp config file: %v", err)
	}
	return path
}

func TestLoadFromFile(t *testing.T) {
	path := writeTempConfigFile(t, `
env: staging
port: 9090
cors_origin: https://staging.example.com
`)
	t.Setenv("CONFIG_FILE", path)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Env != "staging" {
		t.Errorf("Env = %q, want staging", cfg.Env)
	}
	if cfg.Port != 9090 {
		t.Errorf("Port = %d, want 9090", cfg.Port)
	}
	if cfg.CORSOrigin != "https://staging.example.com" {
		t.Errorf("CORSOrigin = %q, want https://staging.example.com", cfg.CORSOrigin)
	}
}

func TestLoadFilePartiallyOverridesDefaults(t *testing.T) {
	// Only `port` is set in the file; env/cors_origin should keep their defaults.
	path := writeTempConfigFile(t, `port: 5001`)
	t.Setenv("CONFIG_FILE", path)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != 5001 {
		t.Errorf("Port = %d, want 5001", cfg.Port)
	}
	if cfg.Env != "development" {
		t.Errorf("Env = %q, want default %q", cfg.Env, "development")
	}
	if cfg.CORSOrigin != "http://localhost:5173" {
		t.Errorf("CORSOrigin = %q, want default", cfg.CORSOrigin)
	}
}

func TestLoadEnvOverridesFile(t *testing.T) {
	path := writeTempConfigFile(t, `port: 5001`)
	t.Setenv("CONFIG_FILE", path)
	t.Setenv("API_PORT", "7000")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != 7000 {
		t.Errorf("Port = %d, want env override 7000, file value was ignored/used incorrectly", cfg.Port)
	}
}

func TestLoadMissingFileIsIgnored(t *testing.T) {
	t.Setenv("CONFIG_FILE", filepath.Join(t.TempDir(), "does-not-exist.yml"))

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v, want nil (missing file should be skipped)", err)
	}
	if cfg.Port != 4000 {
		t.Errorf("Port = %d, want default 4000", cfg.Port)
	}
}

func TestLoadDatabaseURLFromAPIEnv(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	t.Setenv("API_DATABASE_URL", "postgres://api@localhost/db")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.DatabaseURL != "postgres://api@localhost/db" {
		t.Errorf("DatabaseURL = %q, want API_DATABASE_URL value", cfg.DatabaseURL)
	}
}

func TestLoadDatabaseURLFromUnprefixedEnv(t *testing.T) {
	t.Setenv("API_DATABASE_URL", "")
	t.Setenv("DATABASE_URL", "postgres://plain@localhost/db")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.DatabaseURL != "postgres://plain@localhost/db" {
		t.Errorf("DatabaseURL = %q, want DATABASE_URL value", cfg.DatabaseURL)
	}
}

func TestLoadAPIDatabaseURLWinsOverUnprefixed(t *testing.T) {
	t.Setenv("API_DATABASE_URL", "postgres://api@localhost/db")
	t.Setenv("DATABASE_URL", "postgres://plain@localhost/db")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.DatabaseURL != "postgres://api@localhost/db" {
		t.Errorf("DatabaseURL = %q, want API_DATABASE_URL to win", cfg.DatabaseURL)
	}
}
