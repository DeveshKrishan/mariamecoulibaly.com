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
| Frontend | React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, Framer Motion, `@dnd-kit` (drag-and-drop edit mode), Vercel Web Analytics |
| Backend | Go 1.24, [chi](https://github.com/go-chi/chi) router, [koanf](https://github.com/knadh/koanf) for layered config |
| Shared | TypeScript types published as the `@mariame/shared` workspace package |
| Tooling | pnpm workspaces, oxlint + Vitest (`ui`), golangci-lint + `go test` (`api`), commitlint, GitHub Actions CI |
| Hosting | Vercel — `ui` as a static/Vite build, `api` via Vercel's Go Framework Preset |

See [docs/PLAN.md](./docs/PLAN.md) for the full architecture, edit-mode design,
and phased delivery plan.

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
