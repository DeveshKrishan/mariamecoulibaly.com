// Command api runs the HTTP server for the Mariam Coulibaly portfolio backend.
package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/api"
	"github.com/DeveshKrishan/mariamecoulibaly.com/api/internal/config"
)

// version, commit, and date are set at build time via goreleaser ldflags
// (see .goreleaser.yaml). They default to "dev" values for `go run`/`go build`.
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("loading config: %v", err)
	}

	handler := api.NewRouter(cfg)
	addr := fmt.Sprintf(":%d", cfg.Port)

	log.Printf("api %s (%s, built %s) [%s] listening on http://localhost%s", version, commit, date, cfg.Env, addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatal(err)
	}
}
