# mariamecoulibaly.com

Personal portfolio for Mariam Coulibaly. A React rebuild of the existing site at
[mariamecoulibaly.com](https://www.mariamecoulibaly.com/), with an admin edit mode
for drag-and-drop content editing.

This is a monorepo:

| Path | Description |
|------|-------------|
| [`ui`](./ui) | React 19 + Vite frontend |
| [`api`](./api) | Go backend (`net/http`) |
| [`shared`](./shared) | TypeScript types shared by `ui` |

## Getting started

```bash
pnpm install     # installs ui + shared
pnpm dev:ui      # http://localhost:5173
pnpm dev:api     # http://localhost:4000 (requires Go 1.24+)
```

Project documentation lives in [`docs/`](./docs). Start with
[docs/PLAN.md](./docs/PLAN.md) for the architecture, feature scope, and delivery plan.
