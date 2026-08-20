// Package config loads application configuration using koanf, layering
// (in increasing priority) built-in defaults, an optional YAML file, and
// environment variables prefixed with API_.
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/confmap"
	env "github.com/knadh/koanf/providers/env/v2"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
)

const (
	envPrefix         = "API_"
	defaultConfigFile = "config/app-config.yml"
)

// Config holds all runtime configuration for the API server.
type Config struct {
	// Env is the runtime environment: "development" or "production".
	Env string `koanf:"env"`
	// Port is the TCP port the HTTP server listens on.
	Port int `koanf:"port"`
	// CORSOrigin is the single allowed browser origin (the ui dev/prod URL).
	CORSOrigin string `koanf:"cors_origin"`
}

func defaults() map[string]any {
	return map[string]any{
		"env":         "development",
		"port":        4000,
		"cors_origin": "http://localhost:5173",
	}
}

// Load builds a Config from defaults, an optional config file, and
// environment variables, in that order of increasing precedence.
//
// The config file path defaults to "config/app-config.yml" relative to
// the working directory and can be overridden with the CONFIG_FILE
// environment variable. It is optional; if the file doesn't exist, it's
// silently skipped.
//
// Environment variables are read with an API_ prefix, e.g. API_PORT,
// API_CORS_ORIGIN, API_ENV.
func Load() (*Config, error) {
	k := koanf.New(".")

	if err := k.Load(confmap.Provider(defaults(), "."), nil); err != nil {
		return nil, fmt.Errorf("config: loading defaults: %w", err)
	}

	configFile := os.Getenv("CONFIG_FILE")
	if configFile == "" {
		configFile = defaultConfigFile
	}
	if _, err := os.Stat(configFile); err == nil {
		if err := k.Load(file.Provider(configFile), yaml.Parser()); err != nil {
			return nil, fmt.Errorf("config: loading file %q: %w", configFile, err)
		}
	}

	envProvider := env.Provider(".", env.Opt{
		Prefix: envPrefix,
		TransformFunc: func(key, value string) (string, any) {
			return strings.ToLower(strings.TrimPrefix(key, envPrefix)), value
		},
	})
	if err := k.Load(envProvider, nil); err != nil {
		return nil, fmt.Errorf("config: loading environment variables: %w", err)
	}

	var cfg Config
	if err := k.Unmarshal("", &cfg); err != nil {
		return nil, fmt.Errorf("config: unmarshalling: %w", err)
	}

	// PaaS runtimes (Vercel, Railway, Render, Fly, Heroku) assign the
	// listen port via the unprefixed PORT variable and require the server
	// to honor it exactly, so it takes precedence over API_PORT/config/app-config.yml.
	if v := os.Getenv("PORT"); v != "" {
		port, err := strconv.Atoi(v)
		if err != nil {
			return nil, fmt.Errorf("config: parsing PORT %q: %w", v, err)
		}
		cfg.Port = port
	}

	return &cfg, nil
}
