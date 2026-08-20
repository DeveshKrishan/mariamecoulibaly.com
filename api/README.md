# api

Go backend for the Mariam Coulibaly portfolio. See
[docs/PLAN.md](../docs/PLAN.md) at the repo root for the full architecture
and feature plan.

## Development

Requires Go 1.24+.

```bash
pnpm dev:api                 # from repo root
# or
cd api && go run ./cmd/api
```

Runs on http://localhost:4000.

## Configuration

Configuration is loaded with [koanf](https://github.com/knadh/koanf), layered
in increasing priority: built-in defaults → optional `app-config.yml` file →
environment variables. See `internal/config/app-config.go`.

| Env var | Config key | Default | Description |
|---------|------------|---------|--------------|
| `API_ENV` | `env` | `development` | Runtime environment |
| `API_PORT` | `port` | `4000` | HTTP listen port |
| `API_CORS_ORIGIN` | `cors_origin` | `http://localhost:5173` | Allowed origin for browser requests from `ui` |

Copy [`app-config.example.yml`](./app-config.example.yml) to `app-config.yml`
(gitignored) to override defaults locally without env vars, or set
`CONFIG_FILE` to point elsewhere. Environment variables always win over the
file.

## Endpoints

| Method | Path | Description |
|--------|------|--------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/{slug}` | Get a single project |
| `GET` | `/api/pages/about` | Get the About Me page content |

Data is currently in-memory stub data (`internal/api/projects.go`,
`internal/api/about.go`) until Phase 2 (database + auth) lands per
`docs/PLAN.md` Section 10.

## Structure

```
cmd/api/main.go       # entrypoint
internal/api/         # HTTP handlers, router, CORS middleware
internal/config/      # koanf-based config loading
internal/models/      # Project, AboutPage structs (mirror shared/)
```

## Build

```bash
pnpm build:api                                  # from repo root
# or
make build                                      # from api/, -> bin/api
```

## Tooling

All commands run from the `api/` directory (or via `make -C api <target>`):

| Command | Description |
|---------|--------------|
| `make dev` | Run the server with `go run` |
| `make build` | Build the binary to `bin/api` |
| `make fmt` | Format code with `golangci-lint fmt` (gofmt + goimports) |
| `make fmt-check` | Fail if any file isn't formatted (used in CI) |
| `make vet` | `go vet` |
| `make lint` | Run [golangci-lint](https://golangci-lint.run/) using `.golangci.yml` |
| `make test` | `go test ./...` |
| `make release-snapshot` | Build all release artifacts locally with [GoReleaser](https://goreleaser.com/) without publishing |
| `make release` | Publish a real release (CI only; needs a `api/vX.Y.Z` tag + `GITHUB_TOKEN`) |

Install the linter and releaser locally with:

```bash
go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
go install github.com/goreleaser/goreleaser/v2@latest
```

### Releasing

Releases are built by [GoReleaser](https://goreleaser.com/) (see
`.goreleaser.yaml`) and published by the `.github/workflows/api-release.yml`
workflow. Because this is one module inside a monorepo, tags are prefixed
with `api/` (GoReleaser's built-in monorepo tag-prefix support is a Pro-only
feature, so the workflow strips the prefix itself):

```bash
git tag api/v1.0.0
git push origin api/v1.0.0
```
