// Command api runs the HTTP server for the Mariam Coulibaly portfolio backend.
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/api"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
)

// startupPingTimeout is how long API boot waits for Postgres to answer Ping
// before refusing to start.
const startupPingTimeout = 10 * time.Second

// version, commit, and date are set at build time via goreleaser ldflags
// (see .goreleaser.yaml). They default to "dev" values for `go run`/`go build`.
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	content, cleanup, err := openStore(context.Background(), cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("opening content store: %w", err)
	}
	defer cleanup()

	handler := api.NewRouter(cfg, content)
	addr := fmt.Sprintf(":%d", cfg.Port)

	log.Printf("api %s (%s, built %s) [%s] listening on http://localhost%s", version, commit, date, cfg.Env, addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		return err
	}
	return nil
}

func openStore(ctx context.Context, databaseURL string) (store.Store, func(), error) {
	if databaseURL == "" {
		log.Printf("content store: in-memory stubs (set API_DATABASE_URL to use Postgres)")
		return store.NewMemory(), func() {}, nil
	}

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, nil, fmt.Errorf("connecting to database: %w", err)
	}

	// Fail fast on boot if Postgres is unreachable — do not start listening.
	pingCtx, cancel := context.WithTimeout(ctx, startupPingTimeout)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, nil, fmt.Errorf("database ping on startup failed: %w", err)
	}
	log.Printf("content store: postgres (startup ping ok)")

	return store.NewPostgres(pool), pool.Close, nil
}
