# ui

React 19 + Vite frontend for the Mariam Coulibaly portfolio. See
[docs/PLAN.md](../docs/PLAN.md) at the repo root for the full architecture
and feature plan.

## Development

```bash
pnpm install       # from repo root
pnpm dev:ui        # or: pnpm --filter ui dev
```

Runs on http://localhost:5173 and expects the API (`api/`) at
`http://localhost:4000` by default. Override with a `.env` file:

```env
VITE_API_URL=http://localhost:4000
VITE_SITE_URL=http://localhost:5173
```

`VITE_SITE_URL` is the site's public base URL, used to build absolute
`og:image`/`og:url`/canonical URLs for per-page SEO meta tags (see
`src/components/seo/Seo.tsx`). Defaults to the production `ui` Vercel URL
(`https://mariamecoulibaly-com-ui.vercel.app`) when unset.

## Stack

- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Framer Motion (scroll/hover animations)
- `@dnd-kit` (drag-and-drop, for admin edit mode)
- Types shared with the API via `@mariame/shared` (`shared/`)

## Tooling

| Command | Description |
|---------|--------------|
| `pnpm --filter ui lint` | Lint with [oxlint](https://oxc.rs/docs/guide/usage/linter.html) |
| `pnpm --filter ui test` | Run tests once with [Vitest](https://vitest.dev/) (jsdom + Testing Library) |
| `pnpm --filter ui test:watch` | Run tests in watch mode |
| `pnpm --filter ui build` | Type-check (`tsc -b`) and build with Vite |

Tests live alongside the code they test (`*.test.ts(x)`); shared test setup
(jest-dom matchers, an `IntersectionObserver` polyfill for Framer Motion's
`whileInView`) is in `src/test/setup.ts`.
