# mariamecoulibaly.com

Personal portfolio for Mariam Coulibaly. A React rebuild of the existing site at
[mariamecoulibaly.com](https://www.mariamecoulibaly.com/), with an admin edit mode
for drag-and-drop content editing.

This is a pnpm monorepo:

| Path | Description |
|------|-------------|
| [`ui`](./ui) | React 19 + Vite frontend |
| [`api`](./api) | Go backend (chi router) |
| [`shared`](./shared) | TypeScript types shared between `ui` and `api` |
| [`docs`](./docs) | Architecture and delivery plan |

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend (`ui/`) | React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, Framer Motion, `@dnd-kit`, TipTap (planned), Vercel Web Analytics |
| Backend (`api/`) | Go 1.24, [chi](https://github.com/go-chi/chi), [koanf](https://github.com/knadh/koanf), [sqlc](https://sqlc.dev/) + [pgx/v5](https://github.com/jackc/pgx) |
| Database | **Postgres** via Supabase (migrations under `supabase/`) |
| Auth | Supabase Auth (Google OAuth) → JWT verified in Go against project JWKS + `API_ADMIN_EMAILS` allowlist |
| Media | **S3** via Supabase Storage (bucket `project-media`). Local `ui/public/images/` until the upload pipeline lands ([docs/PLAN.md](./docs/PLAN.md) §5.5) |
| Shared | TypeScript types as `@mariame/shared` (`shared/`) |
| Tooling | pnpm workspaces, oxlint + Vitest (`ui`), golangci-lint + `go test` (`api`), commitlint, GitHub Actions CI |
| Hosting | Vercel — `ui` (Vite SPA), `api` (Go Framework Preset) |

See [docs/PLAN.md](./docs/PLAN.md) for the full architecture, edit-mode design,
and phased delivery plan.

## Architecture

Public visitors hit the React SPA; the Go API reads published content from
Postgres (or in-memory stubs when `API_DATABASE_URL` is unset). Admins sign in
with Google via Supabase, then the UI sends Bearer JWTs on write routes.

```mermaid
flowchart LR
  subgraph Client
    UI["ui/<br/>React + Vite SPA"]
  end

  subgraph Backend
    API["api/<br/>Go + chi"]
  end

  subgraph Supabase
    Auth["Auth<br/>Google OAuth + JWKS"]
    DB[(Postgres)]
    Storage[("S3")]
  end

  Visitor((Visitor)) --> UI
  Admin((Admin)) --> UI

  UI -->|"GET /api/projects<br/>GET /api/pages/about"| API
  UI -->|"Google sign-in"| Auth
  Auth -->|"access token"| UI
  UI -->|"admin writes<br/>Bearer JWT"| API

  API -->|"verify JWT"| Auth
  API -->|"sqlc / pgx<br/>read + write"| DB
  API -.->|"signed upload URLs"| Storage
  UI -.->|"upload image"| Storage
```

Request flow (simplified):

```mermaid
sequenceDiagram
  actor User
  participant UI as ui (React)
  participant API as api (Go)
  participant DB as Postgres

  User->>UI: Browse /, /projects/:slug, /about-me
  UI->>API: GET /api/projects, /api/pages/about
  API->>DB: sqlc queries (or in-memory stubs)
  DB-->>API: rows
  API-->>UI: JSON
  UI-->>User: Render pages

  Note over User,DB: Admin edit mode
  User->>UI: Sign in at /admin/login
  UI->>UI: Supabase Google OAuth
  User->>UI: Edit fields / reorder / replace image
  UI->>API: PATCH/PUT/POST + Bearer JWT
  API->>API: JWKS verify + email allowlist
  API->>DB: write + audit_log
  API-->>UI: updated resource
```

## Getting started

Prerequisites: Node.js ≥ 22.12, [pnpm](https://pnpm.io/) 10, and Go 1.24+ (for
the API).

```bash
pnpm install     # installs ui + shared workspace deps
pnpm dev:ui      # http://localhost:5173
pnpm dev:api     # http://localhost:4000 (requires Go 1.24+)
```

Other useful commands from the repo root:

| Command | Description |
|---------|-------------|
| `pnpm --filter ui lint` | Lint the frontend with oxlint |
| `pnpm --filter ui test` | Run frontend tests with Vitest |
| `pnpm build:ui` | Type-check and build the frontend |
| `pnpm build:api` | Build the API binary to `api/bin/api` |
| `pnpm lint:commits` | Validate commit messages against Conventional Commits |

For workspace-specific details (config, endpoints, deployment, releasing),
see [`ui/README.md`](./ui/README.md) and [`api/README.md`](./api/README.md).

## Documentation

Project documentation lives in [`docs/`](./docs). Start with
[docs/PLAN.md](./docs/PLAN.md) for the architecture, feature scope, and delivery plan.
