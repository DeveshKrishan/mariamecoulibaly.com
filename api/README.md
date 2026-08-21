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
in increasing priority: built-in defaults → optional `config/app-config.yml`
file → environment variables. See `internal/config/app-config.go`.

| Env var | Config key | Default | Description |
|---------|------------|---------|--------------|
| `API_ENV` | `env` | `development` | Runtime environment |
| `API_PORT` | `port` | `4000` | HTTP listen port |
| `API_CORS_ORIGIN` | `cors_origin` | `http://localhost:5173` | Allowed origin for browser requests from `ui` |
| `API_DATABASE_URL` | `database_url` | _(empty)_ | Postgres connection string. When unset, the API serves in-memory stub content. |
| `DATABASE_URL` | `database_url` (fallback) | — | Unprefixed Supabase/PaaS URL used only when `API_DATABASE_URL` is empty. |
| `API_SUPABASE_URL` | `supabase_url` | _(empty)_ | Supabase project URL for JWKS JWT verification (e.g. `https://<ref>.supabase.co`). Required with `API_ADMIN_EMAILS` to enable admin routes. |
| `API_ADMIN_EMAILS` | _(parsed)_ | _(empty)_ | Comma-separated allowlist of admin emails (case-insensitive). |
| `PORT` | `port` (override) | — | Unprefixed port assigned by PaaS hosts (Vercel, Railway, Render, Fly). Takes precedence over `API_PORT` when set. |

Create `config/app-config.yml` (gitignored) with any of the keys above to
override defaults locally without env vars, e.g.:

```yaml
port: 4000
cors_origin: http://localhost:5173
```

Or set `CONFIG_FILE` to point elsewhere. Environment variables always win
over the file.

## Endpoints

### Public

| Method | Path | Description |
|--------|------|--------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/projects` | List published projects |
| `GET` | `/api/projects/{slug}` | Get a published project |
| `GET` | `/api/pages/about` | Get the About Me page content |

### Admin (Bearer Supabase access token + allowlisted email)

| Method | Path | Description |
|--------|------|--------------|
| `GET` | `/api/admin/me` | Current admin identity |
| `GET` | `/api/admin/projects` | List non-deleted projects (draft + published) |
| `GET` | `/api/admin/projects/{slug}` | Get a non-deleted project |
| `POST` | `/api/projects` | Create a project |
| `PATCH` | `/api/projects/{slug}` | Update a project |
| `DELETE` | `/api/projects/{slug}` | Soft-delete a project |
| `PUT` | `/api/projects/reorder` | Reorder by `{ "slugs": [...] }` |
| `PUT` | `/api/pages/about` | Replace About Me content |

Auth: UI signs in with **Google via Supabase Auth**; the Go API verifies the
JWT locally against the project's JWKS
(`{API_SUPABASE_URL}/auth/v1/.well-known/jwks.json`) and checks
`API_ADMIN_EMAILS`. Do **not** put the legacy JWT secret on the API.

With no database URL configured, public handlers serve Phase 1 in-memory
stubs. Admin writes require Postgres (`API_DATABASE_URL`) and return 503
otherwise.

## Database (Phase 2)

Schema migrations live in [`supabase/migrations`](../supabase/migrations)
(managed by the [Supabase CLI](https://supabase.com/docs/guides/cli)).
Query code is generated with [sqlc](https://sqlc.dev/) into `internal/db`
(`make sqlc`). Generated files are committed so CI does not need sqlc.

Local flow (requires Docker for `supabase start`):

```bash
# from repo root
supabase start                 # local Postgres on :54322
supabase db reset              # apply migrations (+ empty seed.sql)
export API_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
make -C api seed               # upsert stub projects + about page
pnpm dev:api                   # API reads from Postgres
```

Without Docker / a remote Supabase project, omit `API_DATABASE_URL` and the
API keeps serving in-memory stubs (same JSON shape).

When `API_DATABASE_URL` (or `DATABASE_URL`) **is** set, the process
`Ping`s Postgres during startup (10s timeout) and exits if unreachable —
it will not start listening on a bad connection.

### Automating migrations (CI)

New files under `supabase/migrations/` are handled by
[`.github/workflows/supabase-migrations.yml`](../.github/workflows/supabase-migrations.yml)
(aligned with [Supabase’s environment guide](https://supabase.com/docs/guides/deployment/managing-environments)):

| Event | Behavior |
|-------|----------|
| PR touching migrations | `supabase db start` — apply all migrations to a local CI Postgres (no remote secrets) |
| Push to `main` touching migrations | `supabase link` + `supabase db push` — apply to the hosted project |
| Manual **Run workflow** | Same as main (apply to remote) |

Add these GitHub Actions secrets before **main** deploys can run (PRs do not need them):

| Secret | Where to get it |
|--------|------------------|
| `SUPABASE_ACCESS_TOKEN` | [Account → Access Tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_ID` | Project Settings → General (project ref) |
| `SUPABASE_DB_PASSWORD` | Project Settings → Database |

## Structure

```
cmd/api/main.go       # HTTP server entrypoint
cmd/seed/main.go      # upsert stub content into Postgres
config/               # app-config.yml (gitignored, optional local overrides)
sqlc.yaml             # sqlc config (schema = supabase/migrations)
internal/api/         # HTTP handlers, router, CORS + admin auth middleware
internal/auth/        # Supabase JWKS JWT verification + allowlist
internal/config/      # koanf-based config loading
internal/db/          # sqlc-generated queries (pgx/v5)
internal/models/      # Project, AboutPage structs (mirror shared/)
internal/store/       # content Store (memory stubs + Postgres)
```

## Build

```bash
pnpm build:api                                  # from repo root
# or
make build                                      # from api/, -> bin/api
```

## Deployment

Deployed with Vercel's [Go Framework Preset](https://vercel.com/docs/functions/runtimes/go),
which runs `cmd/api/main.go` as a standalone server (not serverless
functions) — no Dockerfile needed. Routing uses [chi](https://github.com/go-chi/chi)
instead of the stdlib `ServeMux`, since chi is one of the frameworks the
preset explicitly supports.

1. In the Vercel dashboard, create a **new project** from this repo with:
   - **Root Directory:** `api`
   - **Framework Preset:** Go (auto-detected via `api/vercel.json`'s
     `"framework": "go"`, since it finds `go.mod` + `cmd/api/main.go`)
2. Set environment variables on the API project:
   - `API_CORS_ORIGIN` = the deployed `ui` origin, e.g. `https://mariamecoulibaly.vercel.app`
   - `API_DATABASE_URL` = Supabase **session pooler** URL (IPv4). Prefer
     `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
     over the direct `db.<ref>.supabase.co` host (often IPv6-only on Vercel).
   - `API_SUPABASE_URL` = `https://<ref>.supabase.co`
   - `API_ADMIN_EMAILS` = comma-separated admin emails
   - `API_ENV=production` (optional)
   - Vercel sets `PORT` automatically — the server honors it (see
     Configuration table above); don't set `API_PORT` in production.
3. In Supabase: Authentication → Providers → enable **Google**, and add
   redirect URLs for the UI (`http://localhost:5173/**` and production
   `https://…vercel.app/**`).
4. Deploy the API. Note the resulting URL.
5. On the `ui` Vercel project, set `VITE_API_URL`, `VITE_SUPABASE_URL`, and
   `VITE_SUPABASE_ANON_KEY`, then redeploy. Sign in at `/admin/login`.

## Tooling

All commands run from the `api/` directory (or via `make -C api <target>`):

| Command | Description |
|---------|--------------|
| `make dev` | Run the server with `go run` |
| `make build` | Build the binary to `bin/api` |
| `make sqlc` | Regenerate `internal/db` from `sqlc.yaml` + migrations + queries |
| `make seed` | Upsert stub projects + about page (`API_DATABASE_URL` required) |
| `make fmt` | Format code with `golangci-lint fmt` (gofmt + goimports) |
| `make fmt-check` | Fail if any file isn't formatted (used in CI) |
| `make vet` | `go vet` |
| `make lint` | Run [golangci-lint](https://golangci-lint.run/) using `.golangci.yml` |
| `make test` | `go test ./...` |
| `make release-snapshot` | Build all release artifacts locally with [GoReleaser](https://goreleaser.com/) without publishing |
| `make release` | Publish a real release (CI only; needs a `api/vX.Y.Z` tag + `GITHUB_TOKEN`) |

Install the linter, releaser, and sqlc locally with:

```bash
go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest
go install github.com/goreleaser/goreleaser/v2@latest
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
# Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
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
