// Command seed upserts Phase 1 stub content into Postgres.
//
// Requires API_DATABASE_URL or DATABASE_URL pointing at a migrated database
// (run `supabase db reset` or `supabase db push` first).
package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/store"
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
	if cfg.DatabaseURL == "" {
		return fmt.Errorf("API_DATABASE_URL (or DATABASE_URL) is required to seed")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("connecting to database: %w", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		return fmt.Errorf("pinging database: %w", err)
	}

	if err := store.NewPostgres(pool).Seed(ctx); err != nil {
		return fmt.Errorf("seeding: %w", err)
	}

	log.Print("seeded projects and about page")
	return nil
}
