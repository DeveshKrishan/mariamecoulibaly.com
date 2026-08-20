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

- [ ] Admin edit mode (see Section 6)
- [ ] Drag-and-drop project reordering on homepage
- [ ] Inline text editing on About Me and project pages
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

#### Option B: Custom backend (recommended for full edit-mode control)

| Layer | Choice |
|-------|--------|
| API | **Node.js + Express** or **Next.js API routes** |
| Database | **PostgreSQL** (Neon/Supabase) or **SQLite** (Turso) |
| Auth | **Clerk**, **Auth.js**, or **Supabase Auth** |
| Media storage | **Cloudflare R2** or **AWS S3** + CDN |
| ORM | **Drizzle** or **Prisma** |

**Pros:** Full control over drag-and-drop save flow, custom admin UI.  
**Cons:** More code to build and maintain.

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

### 5.1 Project scaffolding

```bash
pnpm create vite . --template react-ts
pnpm add react-router-dom framer-motion @dnd-kit/core @dnd-kit/sortable
pnpm add -D tailwindcss postcss autoprefixer
```

**Package manager:** pnpm (Node 22+). Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/), enforced on pull
requests by the `PR Lint` workflow.

Suggested folder structure:

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── PageLayout.tsx
│   ├── portfolio/
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ProjectDetail.tsx
│   ├── about/
│   │   └── AboutPage.tsx
│   └── editor/          # edit-mode-only components
│       ├── EditToolbar.tsx
│       ├── EditableText.tsx
│       ├── DraggableProjectCard.tsx
│       └── ImageUploader.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useEditMode.ts
│   └── useProjects.ts
├── pages/
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ProjectPage.tsx
│   └── AdminLoginPage.tsx
├── lib/
│   ├── api.ts
│   └── sanitize.ts
├── types/
│   └── content.ts
└── App.tsx
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

```typescript
// types/content.ts
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
{ action: 'project.update', projectId, userId, timestamp, diff }
{ action: 'project.publish', projectId, userId, timestamp }
{ action: 'project.reorder', userId, timestamp, newOrder }
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
| **Vercel** (Hobby/Pro) | React SPA + serverless API | $0–20/mo |
| **Supabase** (free tier) | Postgres + Auth + storage | $0–25/mo |
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

```sql
-- projects
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  role        TEXT,
  summary     TEXT,
  body        JSONB,           -- rich text blocks
  thumbnail_url TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft',  -- draft | published
  published_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- about page (singleton)
CREATE TABLE site_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);
-- keys: 'about_page', 'site_meta', 'social_links'

-- audit log
CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action     TEXT NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

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

- [ ] Database + API routes for projects and about page
- [ ] Admin authentication (magic link or OAuth)
- [ ] Media upload pipeline
- [ ] Draft/publish workflow

### Phase 3 — Edit mode (2 weeks)

- [ ] Edit mode context and toolbar
- [ ] Drag-and-drop project reorder
- [ ] Inline text editing
- [ ] Image upload/replace
- [ ] Auto-save drafts
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

| # | Question | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | CMS or custom backend? | Sanity / custom API | **Custom API** if edit UX is priority; **Sanity** if speed-to-market |
| 2 | Keep exact Squarespace animations? | Pixel-perfect / close enough | Close enough — match feel, not byte-identical CSS |
| 3 | Video hosting | YouTube/Vimeo embeds / self-hosted | Keep existing embeds (YouTube/Vimeo) |
| 4 | Who needs admin access? | Mariam only / Mariam + developer | Start with email allowlist of 1–2 people |
| 5 | Domain registrar access? | Need credentials before DNS cutover | Confirm before Phase 4 |
| 6 | URL slug changes? | Keep all / rename some | **Keep all existing slugs** |
| 7 | RSS feed needed? | Yes / No | Defer to v1.1 unless actively used |
| 8 | Free-form layout editing? | DnD reorder only / full page builder | **Reorder + inline edit only** — avoid page-builder complexity |

---

## Appendix A — Project Inventory (from live site)

| Title | Approx. date |
|-------|--------------|
| Resident Home | Jul 2026 |
| Udacity Accenture | Jun 2026 |
| Flying Upstream Podcast | Nov 2025 |
| Future of the Bay — KQED Special | Sep 2025 |
| Holi Celebration — Pyarful | Mar 2025 |
| Founder Introduction — Pyarful | Mar 2025 |
| Biodiversity and Climate Optimist at Heart — PG&E | Jan 2025 |
| TechWomen — PG&E | Nov 2024 |
| Saluting Branches — PG&E | Nov 2024 |
| Beautification — PG&E | Sep 2024 |
| Inside a No-Kill Animal Shelter — KQED | Sep 2024 |
| Comrade is My Pronoun | Sep 2024 |
| Things to Do at Dolores Park — KQED | Aug 2021 |
| Chabot Fire Academy | Aug 2021 |
| Gorast Droll | Jul 2021 |
| City Surf Project | — |

---

## Appendix B — Quick reference commands

```bash
# Install dependencies
pnpm install

# Local development
pnpm dev

# Production build
pnpm build && pnpm preview

# Check commit messages on the current branch
pnpm lint:commits

# Run migration script (after Phase 0)
pnpm migrate

# Deploy (Vercel)
vercel --prod
```

---

*Document created: August 2026*  
*Next step: Review open questions in Section 11, then begin Phase 0 scaffolding.*
