# Documentation

| Document | Contents |
|----------|----------|
| [PLAN.md](./PLAN.md) | Site audit, React architecture, edit mode design, security model, hosting and domain migration, phased delivery plan |

Database migrations live in [`../supabase`](../supabase) (Supabase CLI). The Go
API reads them via sqlc — see [`../api/README.md`](../api/README.md).
