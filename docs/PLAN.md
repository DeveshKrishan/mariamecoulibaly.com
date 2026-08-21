# Mariam Coulibaly Portfolio — React Rebuild Plan

> **Source site:** [mariamecoulibaly.com](https://www.mariamecoulibaly.com/)  
> **Current platform:** Squarespace (Portfolio template 7.1)  
> **Goal:** Recreate all public features in React, plus an admin **edit mode** with drag-and-drop content editing.

---

## Table of Contents

1. [Current Site Audit](#1-current-site-audit)
2. [Feature Parity Checklist](#2-feature-parity-checklist)
3. [Recommended Tech Stack](#3-recommended-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [React Implementation Plan](#5-react-implementation-plan)
6. [Edit Mode & Drag-and-Drop Design](#6-edit-mode--drag-and-drop-design)
7. [Admin Security Model](#7-admin-security-model)
8. [Domain & Hosting Migration](#8-domain--hosting-migration)
9. [Data Model & Content Migration](#9-data-model--content-migration)
10. [Phased Delivery Plan](#10-phased-delivery-plan)
11. [Open Questions & Decisions](#11-open-questions--decisions)

---

## 1. Current Site Audit

### Site structure

| Route | Purpose |
|-------|---------|
| `/` | Projects index — masonry-style portfolio grid |
| `/about-me` | Bio, headline, social/resume links |
| `/projects/:slug` | Individual project detail pages (~16 projects) |
| `/projects?format=rss` | RSS feed (optional parity item) |

### Navigation

- **Fixed transparent header** that becomes solid on scroll (“scroll back” style)
- Two nav items: **Projects** (home) and **About Me**
- Mobile: hamburger → full-screen overlay menu

### Visual design

- **Typography:** Space Mono (primary), Adobe Typekit secondary font
- **Palette:** Black text on white background, minimal aesthetic
- **Layout:** Full-width portfolio grid, 4:3 image aspect ratio, inset header
- **Animations:** Fade-in on scroll, scale-up hover on grid items, cursor-follow hover text on desktop

### Homepage (Projects grid)

Each project card shows:

- Thumbnail image
- Project title (e.g. “Resident Home”, “Chabot Fire Academy”)
- Author name + date metadata on hover

Projects are ordered newest-first (dates range from 2021–2026).

### Project detail pages

Each project page includes:

- Title (H1)
- Date
- Role / credit line (e.g. “Assistant Editor — Freelance”)
- Body copy describing the work
- Embedded media (video players, images)
- “Next project” navigation link at bottom

### About Me page

- Hero headline: *“an emerging media professional from the San Francisco Bay Area”*
- Bio paragraph
- **My Links** section:
  - LinkedIn profile
  - Resume (Google Drive PDF)

### Known project slugs (for URL parity)

```
/projects/residenthome
/projects/udacity
/projects/flyingupstream
/projects/kqed
/projects/biodiversitypge
/projects/salutingbranches
/projects/chabotfireacademy
/projects/kqedanimalshelter
/projects/interview-sofia-pazari-efmtt
/projects/interview-craig-classon-4pfep-smwas
/projects/interview-chase-nevins-zwcl9
… (additional interview/project variants)
```

Preserve existing slugs during migration to avoid broken links and SEO loss.

---

## 2. Feature Parity Checklist

### Must have (v1)

- [ ] Responsive portfolio grid on homepage
- [ ] Hover effects matching current site (fade + scale-up)
- [ ] Fixed/transparent header with scroll behavior
- [ ] Mobile navigation overlay
- [ ] Project detail pages with media embeds
- [ ] About Me page with editable bio and external links
- [ ] SEO meta tags (title, description, Open Graph)
- [ ] Fast image loading (lazy load, responsive sizes)
- [ ] Custom domain support (`www.mariamecoulibaly.com`)
- [ ] HTTPS everywhere

### Should have (v1.1)

- [x] Admin edit mode (see Section 6) — core toggle/toolbar/reorder/inline fields (TipTap/body + upload deferred)
- [x] Drag-and-drop project reordering on homepage
- [x] Inline text editing on About Me and project pages
- [ ] Image upload/replace in edit mode
- [ ] Preview before publish

### Nice to have (v2)

- [ ] RSS feed at `/projects?format=rss`
- [ ] 301 redirects from all old Squarespace URLs
- [ ] Analytics (Plausible or GA4)
- [ ] Draft vs. published states
- [ ] Revision history / undo
- [ ] Multiple admin users with roles

---

## 3. Recommended Tech Stack

### Frontend

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **React 19 + Vite** | Fast dev, simple deploy, no SSR complexity needed for a portfolio |
| Routing | **React Router v7** | Client-side routing for `/`, `/about-me`, `/projects/:slug` |
| Styling | **Tailwind CSS** or **CSS Modules** | Match minimal black/white design; Tailwind speeds iteration |
| Animations | **Framer Motion** | Scroll fade-ins, hover scale, page transitions |
| Drag & drop | **@dnd-kit/core** + **@dnd-kit/sortable** | Accessible, React-native DnD for edit mode |
| Rich text | **TipTap** or **contenteditable + sanitization** | Inline editing in admin mode |
| Fonts | **Google Fonts (Space Mono)** + self-hosted fallback | Replace Typekit dependency |

### Backend & CMS

Two viable approaches — pick one before Phase 2:

#### Option A: Headless CMS (recommended for simplicity)

| Layer | Choice |
|-------|--------|
| CMS | **Sanity** or **Contentful** |
| Auth | CMS built-in auth + role-based access |
| Media | CMS asset pipeline or **Cloudinary** |
| API | CMS GraphQL/REST from React |

**Pros:** Auth, media, drafts, and versioning largely handled.  
**Cons:** Monthly cost, less control over edit UX.

#### Option B: Custom backend (recommended for full edit-mode control) — ✅ **Selected**

| Layer | Choice |
|-------|--------|
| API | **Go** (`net/http`, Go 1.24+) — see `api/` |
| Database | **Supabase** (hosted PostgreSQL) — see Section 9 for schema |
| DB access | [sqlc](https://sqlc.dev/) (generates type-safe Go from SQL) targeting `pgx/v5` as the runtime driver — no ORM |
| Migrations | **Supabase CLI** (`supabase migration new` / `supabase db push`) — also gives a local Postgres via `supabase start` that sqlc generates against |
| Go tooling | [koanf](https://github.com/knadh/koanf) (config loading), [golangci-lint](https://golangci-lint.run/) (linting), [GoReleaser](https://goreleaser.com/) (releases), `gofmt`/`goimports` (formatting) |
| Auth | Session/JWT middleware with an admin email allowlist (Section 7) |
| Media storage | **Cloudflare R2** or **AWS S3** + CDN |

**Pros:** Full control over drag-and-drop save flow, custom admin UI, small static binary, fast startup, low memory footprint.  
**Cons:** More code to build and maintain; smaller ecosystem of CMS-style helpers than Node.

### Hosting (see Section 8)

| Component | Recommendation |
|-----------|----------------|
| Frontend | **Vercel**, **Netlify**, or **Cloudflare Pages** |
| API (if custom) | **Railway**, **Fly.io**, or **Vercel serverless** |
| Domain DNS | **Cloudflare** (registrar or DNS-only) |
| CDN / images | **Cloudflare Images** or **Cloudinary** |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Public Site                          │
│  React SPA (Vite) — served as static assets + client router │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────────┐   │
│  │  Header  │  │ Projects │  │  Project Detail / About │   │
│  └──────────┘  │   Grid   │  └─────────────────────────┘   │
│                └──────────┘                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │ fetch published content
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Content API / CMS                        │
│  GET /api/projects  GET /api/pages/about  GET /api/projects/:slug │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Database + Media Storage                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Admin Edit Mode                          │
│  Same React app, `/admin` routes, auth-gated                │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Login/OAuth │  │ Visual Editor│  │ Publish / Draft │   │
│  └─────────────┘  │ (DnD + inline│  └─────────────────┘   │
│                   │  text edit)  │                          │
│                   └──────────────┘                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ authenticated writes only
                           ▼
                    Content API (POST/PATCH/DELETE)
```

### Key design principle: **one codebase, two modes**

The public site and admin editor share the same React components. In **view mode**, components render read-only content. In **edit mode** (enabled when an authenticated admin is logged in), the same components gain:

- Drag handles
- Inline editable text fields
- Image replace controls
- A floating toolbar (Save, Preview, Publish, Exit edit mode)

This avoids maintaining a separate admin UI that can drift from the public design.

---

## 5. React Implementation Plan

### 5.1 Project scaffolding — Monorepo layout

This is a **pnpm monorepo** with a React frontend and a **Go** backend as
top-level sibling folders, plus a shared TypeScript types package:

```
.
├── ui/                          # React 19 + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   └── PageLayout.tsx
│       │   ├── portfolio/
│       │   │   ├── ProjectGrid.tsx
│       │   │   └── ProjectCard.tsx
│       │   └── editor/          # edit-mode-only components (Phase 3)
│       ├── hooks/
│       │   └── useProjects.ts
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── AboutPage.tsx
│       │   └── ProjectPage.tsx
│       ├── lib/
│       │   └── api.ts           # fetch client for the Go API
│       └── App.tsx
├── api/                         # Go backend (net/http)
│   ├── go.mod
│   ├── .golangci.yml            # golangci-lint config
│   ├── .goreleaser.yaml         # GoReleaser config (tagged api/vX.Y.Z releases)
│   ├── Makefile                 # dev, build, fmt, lint, test, release targets
│   ├── cmd/api/main.go
│   └── internal/
│       ├── api/                 # HTTP handlers, router, middleware
│       ├── config/              # koanf-based config loading
│       └── models/              # Project, AboutPage structs
├── shared/                      # TS types shared by the ui app (Project, AboutPage)
├── pnpm-workspace.yaml
└── package.json                 # root scripts: dev:ui, dev:api, build:ui, build:api
```

**Package managers:** pnpm (Node 22+) for `ui` and `shared`; Go
modules (Go 1.24+) for `api`. Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/), enforced on pull
requests by the `PR Lint` workflow.

```bash
# scaffold commands used to set this up
pnpm create vite ui --template react-ts
cd ui && pnpm add react-router-dom framer-motion @dnd-kit/core @dnd-kit/sortable
pnpm add -D tailwindcss @tailwindcss/vite

cd api && go mod init github.com/DeveshKrishan/mariamecoulibaly.com/api
```

Run each app during development from the repo root:

```bash
pnpm dev:ui    # Vite dev server on :5173
pnpm dev:api   # Go API on :4000
```

### 5.2 Core components

#### `Header`

- Transparent over hero content; solid white background after scroll threshold
- Logo/site title: “Mariam Coulibaly”
- Nav links: Projects, About Me
- Edit mode: show “Edit” button for authenticated admins

#### `ProjectGrid`

- CSS Grid or masonry layout (consider `react-masonry-css` for parity)
- Maps over `projects[]` sorted by `publishedAt` desc
- Each card: thumbnail, title, hover overlay with date
- Framer Motion: `whileHover={{ scale: 1.03 }}`, fade-in on scroll

#### `ProjectDetail`

- Dynamic route: `/projects/:slug`
- Renders title, date, role, rich text body, media blocks
- Bottom: link to next project in sort order
- 404 for unknown slugs

#### `AboutPage`

- Static layout with CMS-driven content blocks
- External links open in new tab (`rel="noopener noreferrer"`)

### 5.3 Data fetching

Types are defined once in `shared/src/content.ts` and imported by
`ui` as `@mariame/shared`. The Go API (`api/internal/models`)
mirrors the same shape in Go structs with matching `json` tags, since Go
can't import the TypeScript package directly — keep the two in sync when the
schema changes.

```typescript
// shared/src/content.ts
interface Project {
  id: string;
  slug: string;
  title: string;
  publishedAt: string;       // ISO date
  role: string;
  summary: string;
  body: RichTextBlock[];
  thumbnailUrl: string;
  sortOrder: number;
  status: 'draft' | 'published';
}

interface AboutPage {
  headline: string;
  bio: string;
  links: { label: string; url: string }[];
}
```

Public site fetches only `status: 'published'` content. Admin edit mode fetches drafts too.

### 5.4 Styling approach

Match Squarespace design tokens:

| Token | Value |
|-------|-------|
| Font | `'Space Mono', monospace` |
| Max page width | `1280px` |
| Page padding | `5vw` |
| Grid image ratio | `4:3` |
| Primary color | `#000` on `#fff` |
| Header height | ~`1.8vw` vertical padding |
| Animation duration | `0.8s ease` fade |

Use CSS custom properties in `:root` so edit mode can expose a simple theme panel later.

### 5.5 Media handling

- Store originals in object storage (R2/S3)
- Serve via CDN with transforms: `?w=800`, `?w=1600`, WebP/AVIF
- Lazy load images with `loading="lazy"` and `srcSet`
- Video: embed YouTube/Vimeo iframes or self-hosted `<video>` with poster

---

## 6. Edit Mode & Drag-and-Drop Design

### 6.1 Entering edit mode

1. Admin navigates to `/admin/login` (or clicks “Edit” in header when session exists)
2. After auth, app sets `editMode: true` in context
3. URL can optionally show `?edit=1` for bookmarking
4. Visual indicator: subtle border/badge on editable regions

### 6.2 What admins can edit

| Element | Interaction |
|---------|-------------|
| Project order on homepage | Drag-and-drop reorder (`@dnd-kit/sortable`) |
| Project title, role, body | Click-to-edit inline text |
| Project thumbnail | Click → upload modal → replace image |
| About Me headline & bio | Inline edit |
| External links | Editable list (add/remove/reorder) |
| New project | “+ Add project” button in grid |
| Delete project | Trash icon with confirmation dialog |

### 6.3 Edit workflow

```
Edit → Auto-save draft (debounced, every 2s) → Preview → Publish
```

- **Draft:** Visible only to authenticated admins (preview URL or `?preview=draft` token)
- **Publish:** Writes to published content; invalidates CDN cache
- **Discard:** Revert to last published version

### 6.4 DnD implementation sketch

```tsx
// Simplified pattern with @dnd-kit
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={projects.map(p => p.id)}>
    {projects.map(project => (
      <SortableProjectCard
        key={project.id}
        project={project}
        editMode={editMode}
      />
    ))}
  </SortableContext>
</DndContext>
```

On `dragEnd`, update local state and PATCH `/api/projects/reorder` with ordered IDs.

### 6.5 Inline text editing

Use a controlled `contentEditable` wrapper or TipTap:

```tsx
function EditableText({ value, onChange, editMode }) {
  if (!editMode) return <span>{value}</span>;
  return (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent)}
    />
  );
}
```

Always sanitize HTML before save (DOMPurify) to prevent XSS.

### 6.6 What NOT to allow in edit mode

- Arbitrary HTML/script injection
- Dragging elements outside defined zones (only reorder projects, not free-form layout)
- Editing routing/slugs without confirmation (breaks external links)
- Uploading executable files

---

## 7. Admin Security Model

> **Core rule:** Never trust the client. All write operations must be authenticated and authorized server-side.

### 7.1 Authentication options

| Method | Best for |
|--------|----------|
| **Magic link email** (Resend + Auth.js) | Single admin (Mariam), low friction |
| **Google OAuth** (Clerk / Auth.js) | If admin uses Google account |
| **Username + password + MFA** | Maximum control, more setup |

**Recommendation:** Magic link or Google OAuth for a single-admin portfolio. Add MFA if using password auth.

### 7.2 Authorization

- Maintain an **allowlist of admin emails** in server env (`ADMIN_EMAILS=mariam@example.com`)
- JWT/session checked on every mutating API route
- Role model (future): `owner` | `editor` | `viewer`

```typescript
// Middleware pseudocode
async function requireAdmin(req, res, next) {
  const session = await getSession(req);
  if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });
  if (!ADMIN_EMAILS.includes(session.user.email)) return res.status(403).json({ error: 'Forbidden' });
  next();
}
```

### 7.3 API security checklist

- [ ] HTTPS only; HSTS enabled
- [ ] HttpOnly, Secure, SameSite=Strict session cookies
- [ ] CSRF protection on state-changing requests (if cookie auth)
- [ ] Rate limiting on login and upload endpoints (e.g. 10 req/min)
- [ ] Input validation with **Zod** on all request bodies
- [ ] HTML sanitization (DOMPurify) before storing rich text
- [ ] File upload: whitelist MIME types (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`), max size (e.g. 20 MB images, 100 MB video)
- [ ] Generate UUID filenames; never use user-supplied paths
- [ ] Content Security Policy headers on frontend
- [ ] No admin routes or edit UI bundled with secrets; API keys server-side only

### 7.4 Edit mode exposure

| Concern | Mitigation |
|---------|------------|
| Public users see edit UI | Edit components render only when `session.isAdmin === true` |
| Someone calls API directly | Server validates session + admin allowlist on every write |
| Session hijacking | Short-lived tokens, secure cookies, optional IP binding |
| XSS via edited content | Sanitize on save; CSP `script-src 'self'` on public site |
| Unauthorized image upload | Signed upload URLs scoped to authenticated admin |

### 7.5 Audit log (recommended)

Log admin actions for accountability:

```
{ action: 'project.update', projectId, userEmail, userDisplayName, timestamp, diff }
{ action: 'project.publish', projectId, userEmail, userDisplayName, timestamp }
{ action: 'project.reorder', userEmail, userDisplayName, timestamp, newOrder }
```

---

## 8. Domain & Hosting Migration

### 8.1 Current state

- Domain: `mariamecoulibaly.com` (likely registered via Squarespace or a third party)
- DNS points to Squarespace (`server: Squarespace` in response headers)
- SSL managed by Squarespace

### 8.2 Target state

```
mariamecoulibaly.com  →  React app (Vercel/Netlify/Cloudflare Pages)
www.mariamecoulibaly.com  →  same (canonical)
api.mariamecoulibaly.com  →  backend API (if custom backend)
```

### 8.3 Migration steps

#### Step 1: Deploy React app to staging

1. Push repo to GitHub
2. Connect to Vercel (or Netlify)
3. Deploy to temporary URL: `mariam-portfolio.vercel.app`
4. Verify all pages, images, and responsive behavior

#### Step 2: Prepare DNS (low downtime)

1. **Lower TTL** on domain DNS records to 300s (5 min) — do this 24–48 hours before cutover
2. Add DNS records for new host:

   | Type | Name | Value |
   |------|------|-------|
   | A / CNAME | `@` | Vercel/Netlify apex IP or CNAME |
   | CNAME | `www` | `cname.vercel-dns.com` (example) |
   | CNAME | `api` | API host (if applicable) |

3. Enable SSL on new host (automatic with Vercel/Netlify/Cloudflare)

#### Step 3: Domain registrar decision

**If domain is registered at Squarespace:**

- Option A: Transfer domain to Cloudflare Registrar (at-cost pricing, good DNS)
- Option B: Keep registration at Squarespace, change DNS to point elsewhere (Cloudflare DNS or Vercel DNS)

**If domain is elsewhere (GoDaddy, Namecheap, etc.):**

- Update nameservers or A/CNAME records only

#### Step 4: Cutover

1. Deploy production build
2. Update DNS records
3. Wait for propagation (minutes to hours with low TTL)
4. Verify HTTPS on `www.mariamecoulibaly.com`
5. Cancel Squarespace subscription after 1–2 weeks of stable operation

#### Step 5: SEO preservation

- Add **301 redirects** for any URL changes (e.g. if slugs change)
- Submit updated sitemap to Google Search Console
- Keep old slugs identical where possible
- Set canonical URLs in React `<head>`

### 8.4 Recommended hosting stack (simple)

| Service | Role | Est. cost |
|---------|------|-----------|
| **Vercel/Netlify/Cloudflare Pages** | React SPA (`ui/`) static hosting | $0–20/mo |
| **Fly.io** or **Railway** | Go API (`api/`) — compiles to a small static binary, deploys well as a container | $0–10/mo |
| **Supabase** (free tier) | Postgres + migrations (CLI) + storage | $0–25/mo |
| **Cloudflare** | DNS + CDN + R2 storage | $0–5/mo |
| **Cloudinary** (optional) | Image transforms | $0–25/mo |

**Total:** ~$0–50/mo vs Squarespace ~$16–26/mo, with full control and custom edit mode.

### 8.5 Environment variables

```env
# Frontend (.env)
VITE_API_URL=https://api.mariamecoulibaly.com
VITE_SITE_URL=https://www.mariamecoulibaly.com

# Backend (.env — never commit)
DATABASE_URL=postgresql://...
ADMIN_EMAILS=mariam@example.com
SESSION_SECRET=<random-64-char-string>
S3_BUCKET=mariam-portfolio-media
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

---

## 9. Data Model & Content Migration

### 9.1 Database schema (custom backend option)

Schema lives as **Supabase CLI migrations** (`supabase/migrations/*.sql`); Go
query code is generated from it with **sqlc** (`api/internal/db/queries/*.sql` →
generated structs/methods using `pgx/v5`). Scaffolded in Phase 2 — see
`api/README.md` (Database section) and `make -C api sqlc` / `make -C api seed`.
Auth, media upload, and draft/publish writes are still outstanding.

```sql
-- projects
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL,  -- unique among non-deleted rows (partial unique index)
  title       TEXT NOT NULL,
  client      TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  summary     TEXT NOT NULL DEFAULT '',
  body        JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ,  -- soft delete for edit-mode undo
  created_by_email TEXT NOT NULL DEFAULT '',
  created_by_display_name TEXT NOT NULL DEFAULT '',
  updated_by_email TEXT NOT NULL DEFAULT '',
  updated_by_display_name TEXT NOT NULL DEFAULT ''
);

-- about page (singleton) + future site-wide knobs
CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
-- keys: 'about_page', 'site_meta', 'social_links'

-- audit log
CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_display_name TEXT NOT NULL DEFAULT '',
  action     TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

> **Deferred:** a `media` table for editor-uploaded images (thumbnails / body
> images in object storage). Videos stay as YouTube/Vimeo/Drive links in
> `projects.body`. Add `media` when image upload lands.

### 9.2 Content migration from Squarespace

1. **Export** content manually (Squarespace has limited export — mostly WordPress format for blogs)
2. **Scrape** remaining content programmatically:
   - Fetch each `/projects/:slug` page
   - Extract title, date, role, body, image URLs
   - Download images to new storage
3. **Seed** database with migrated JSON
4. **Verify** each project page side-by-side with live Squarespace site
5. **Redirect map** for any slug mismatches

Migration script (one-time):

```bash
node scripts/migrate-from-squarespace.ts
```

---

## 10. Phased Delivery Plan

### Phase 0 — Discovery & setup (1 week)

- [ ] Confirm tech stack choice (CMS vs custom backend)
- [ ] Confirm domain registrar and access
- [ ] Set up repo, CI, staging deploy
- [ ] Export/scrape all Squarespace content

### Phase 1 — Public site parity (2–3 weeks)

- [ ] Vite + React + Router scaffold
- [ ] Header, mobile nav, page layout
- [ ] Project grid with hover animations
- [ ] Project detail pages
- [ ] About Me page
- [ ] Content loaded from JSON/CMS
- [ ] Responsive QA (mobile, tablet, desktop)
- [ ] Deploy to staging URL

### Phase 2 — Backend & auth (1–2 weeks)

- [x] Scaffold `supabase/` CLI migrations for the schema in Section 9.1 (hosted Supabase project still to be linked)
- [x] Set up sqlc (`api/sqlc.yaml`, `api/internal/db/queries`) generating against `pgx/v5`; wire `internal/db` + `internal/store` into the API
- [x] Database-backed public GET routes for projects and about page (Postgres when `API_DATABASE_URL` is set; in-memory stubs otherwise)
- [x] Admin authentication (Supabase Google OAuth + JWKS verify + `API_ADMIN_EMAILS` allowlist; `/admin/login`)
- [x] Authenticated write APIs (create/update/soft-delete/reorder projects, update about, audit_log)
- [ ] Media upload pipeline
- [ ] Draft/publish workflow UI (API already accepts `draft` / `published` status)

### Phase 3 — Edit mode (2 weeks)

- [x] Edit mode context and toolbar (`?edit=1`, floating status bar)
- [x] Drag-and-drop project reorder (+ add / soft-delete)
- [x] Inline text editing (project meta + About; bio as textarea)
- [ ] Image upload/replace
- [ ] TipTap / body block editor
- [ ] Auto-save drafts + Publish workflow UI
- [ ] Preview and publish

### Phase 4 — Migration & launch (1 week)

- [ ] Production deploy
- [ ] DNS cutover
- [ ] 301 redirects
- [ ] Google Search Console update
- [ ] Monitor for 1–2 weeks
- [ ] Cancel Squarespace

### Phase 5 — Polish (ongoing)

- [ ] RSS feed
- [ ] Analytics
- [ ] Performance audit (Lighthouse 90+)
- [ ] Revision history

**Estimated total:** 7–9 weeks for one developer, part-time.

---

## 11. Open Questions & Decisions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | CMS or custom backend? | Sanity / custom API | ✅ **Custom API** (Node/Express or Next.js API routes + Postgres) — full control over edit UX |
| 2 | Keep exact Squarespace animations? | Pixel-perfect / close enough | ✅ **Pixel-perfect** — recreate fade/scale/hover animations as closely as possible, including timing/easing |
| 3 | Video hosting | YouTube/Vimeo embeds / self-hosted | ✅ **Keep existing embeds** (YouTube/Vimeo) |
| 4 | Who needs admin access? | Mariam only / Mariam + developer | ✅ **Email allowlist of 1–2 people** (Mariam + developer) |
| 5 | Domain registrar access? | Need credentials before DNS cutover | ⚠️ **Unresolved** — registrar unknown; run a WHOIS/`dig`/`whois mariamecoulibaly.com` check and confirm login access before Phase 4 (DNS cutover) |
| 6 | URL slug changes? | Keep all / rename some | ✅ **Keep all existing slugs** |
| 7 | RSS feed needed? | Yes / No | ✅ **Defer to v1.1** unless actively used |
| 8 | Free-form layout editing? | DnD reorder only / full page builder | ✅ **Reorder + inline edit only** — avoid page-builder complexity |

**Note on #2 (pixel-perfect animations):** this raises effort in Section 5.4/6 — plan to closely inspect the live site's computed styles/timings (fade duration, scale factor, cursor-follow hover text behavior) during Phase 0 discovery rather than approximating.

**Action item on #5 (domain registrar):** blocks Phase 4 (Migration & launch). Should be resolved during Phase 0.

---

## Appendix A — Project Inventory (from live site)

Exact titles, dates, and slugs, in the same reverse-chronological order the
live site displays them (resolved from `sitemap.xml` + each project page's
`<title>`, since Squarespace's auto-generated slugs for renamed projects
don't match their titles). Seeded into `api/internal/store/stubs_projects.go`
(and upserted via `make -C api seed`).

| # | Title | Published | Slug (ours) |
|---|-------|-----------|--------------|
| 1 | Resident Home | 2026-07-22 | `residenthome` |
| 2 | Udacity Accenture | 2026-06-13 | `udacity` |
| 3 | Flying Upstream Podcast | 2025-11-13 | `flyingupstream` |
| 4 | Future of the Bay- KQED Special | 2025-09-15 | `future-of-the-bay-kqed-special` |
| 5 | Holi Celebration- Pyarful | 2025-03-21 | `holi-celebration-pyarful` |
| 6 | Founder Introduction- Pyarful | 2025-03-21 | `founder-introduction-pyarful` |
| 7 | Biodiversity and Climate Optimist at Heart- PG&E | 2025-03-18 | `biodiversitypge` |
| 8 | TechWomen- PG&E | 2025-01-15 | `techwomen-pge` |
| 9 | Saluting Branches- PG&E | 2024-11-04 | `salutingbranches` |
| 10 | Beautification- PG&E | 2024-11-04 | `beautification-pge` |
| 11 | Inside a No-Kill Animal Shelter- KQED | 2024-09-27 | `kqedanimalshelter` |
| 12 | Comrade is My Pronoun | 2024-09-27 | `comrade-is-my-pronoun` |
| 13 | Things to Do at Dolores Park This Summer- KQED | 2024-09-27 | `kqed` |
| 14 | Chabot Fire Academy | 2021-08-05 | `chabotfireacademy` |
| 15 | Gorast Droll | 2021-08-04 | `gorast-droll` |
| 16 | City Surf Project | 2021-07-30 | `city-surf-project` |

Slugs `residenthome`, `udacity`, `flyingupstream`, `biodiversitypge`,
`salutingbranches`, `kqedanimalshelter`, `kqed`, and `chabotfireacademy` are
copied verbatim from the live site (worth preserving as redirect targets at
cutover — see Section 8). The rest had meaningless auto-generated slugs
(e.g. `interview-collette-noll-99kld-c2f3z-sm3ed-pygw2-lcnl4-73rt7-dtyyx`)
on the live site, so we generated clean kebab-case ones from their titles
instead.

Roles, summaries, body copy, and thumbnails for all 16 projects are now
migrated from the reference site's detail pages (including embedded
YouTube videos and outbound "Watch Here" links to Instagram/Google Drive
for content that can't be embedded inline). Stub datasets live in
`api/internal/store/stubs_*.go` (in-memory fallback + `make seed` source).

---

## Appendix B — Design Tokens (from reference site)

Reverse-engineered from the live site's compiled Squarespace CSS
(`site.css`'s `--body-font-font-family`, `--heading-font-font-family`,
`--accent-hsl`, `--black-hsl` custom properties) and applied in
`ui/src/index.css` via Tailwind v4's `@theme`.

| Token | Reference site value | Our implementation |
|-------|----------------------|---------------------|
| Body font | `Space Mono` (Google Font) | Loaded via Google Fonts `<link>` in `ui/index.html`; exact match |
| Heading font | `"Gopher"` — a paid Adobe Fonts (Typekit) kit, domain-locked to the live site | **Not reusable.** Substituted `Space Grotesk` (free, Google Fonts) — same "Space" family as Space Mono, similar geometric/quirky character to Gopher's reverse-contrast geometric sans |
| Text color | `hsl(0, 40%, 5.88%)` ≈ `#150909` (warm off-black) | `--color-ink` in `ui/src/index.css` |
| Accent color | `hsl(19.04, 98.11%, 79.22%)` ≈ `#feb796` (soft peach/salmon) | `--color-accent` in `ui/src/index.css` (reserved for future hover/accent states) |
| Dark accent | `hsl(240, 55.4%, 29%)` ≈ `#202072` (navy — About Me hero) | `--color-dark-accent` in `ui/src/index.css`; applied to the About hero section |
| Background | white | white |

If a real Adobe Fonts (Creative Cloud) subscription becomes available,
swap the `Space Grotesk` `<link>` for the licensed Typekit kit `<script>`
and update `--font-heading` in `ui/src/index.css` — no other changes needed.

---

## Appendix C — Quick reference commands

```bash
# Install JS dependencies (ui + shared)
pnpm install

# Local development
pnpm dev:ui     # React app on http://localhost:5173
pnpm dev:api    # Go API on http://localhost:4000

# Production build
pnpm build:ui   # ui/dist
pnpm build:api  # api/bin/api

# Check commit messages on the current branch
pnpm lint:commits

# Go: format, vet, lint, test (see api/Makefile)
cd api && make fmt-check && make vet && make lint && make test

# Go: cut a release (tags api/vX.Y.Z, built by .github/workflows/api-release.yml)
git tag api/v1.0.0 && git push origin api/v1.0.0

# Run content migration script (after Phase 0)
pnpm migrate

# Deploy (Vercel for ui, Fly.io/Railway for the Go api)
vercel --prod

# --- Phase 2 ---
# Supabase: local Postgres + schema migrations (requires Docker)
supabase start
supabase db reset          # apply migrations; then:
# export API_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
# make -C api seed

# sqlc: regenerate Go query code after editing schema/queries
cd api && make sqlc

# Migrations on main are applied by GitHub Actions
# (.github/workflows/supabase-migrations.yml) once repo secrets are set —
# see api/README.md "Automating migrations (CI)".
```

---

*Document created: August 2026*  
*Next step: Review open questions in Section 11, then begin Phase 0 scaffolding.*
