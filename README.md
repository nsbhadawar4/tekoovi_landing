# Tekoovi — Landing Page + Admin CMS

A premium marketing site with a self-contained admin panel. All page content is
editable from `/admin`; the public site reads it on every request so edits show
up immediately. Built on Next.js (App Router) with a small layered backend on
MongoDB.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design system in `app/globals.css`)
- **Motion** for animation, **Lenis** for smooth scroll, **lucide-react** icons
- **MongoDB** via **Mongoose** (falls back to a local JSON file when no DB is set)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Create `.env.local`:

```bash
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/tekoovi   # omit to use the local JSON store
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=<a-strong-password>                          # REQUIRED in production
```

> The admin login falls back to dev defaults (`tekoovi@gmail.com` / `admin123`)
> only when these are unset. **Always set a real `ADMIN_PASSWORD` before going
> live.**

## Scripts

| Command         | What it does               |
| --------------- | -------------------------- |
| `npm run dev`   | Dev server (Turbopack)     |
| `npm run build` | Production build           |
| `npm run start` | Serve the production build |
| `npm run lint`  | ESLint                     |

## Folder structure

```
app/                      Next.js App Router — routing only, thin pages
  (site)/                 Public site (shared layout: navbar, footer, theme)
    page.tsx              Home
    work-detail/[slug]/   Project case-study pages
    case-study-detail/    Featured case study
    privacy, terms/       Legal pages
  admin/                  Admin panel (login + dashboard)
  api/                    Route handlers
    content/[section]/    CRUD for every content section
    media/                Image upload + serve + migrate
    admin/login/          Auth
  layout.tsx, globals.css Root layout + design system

backend/                  Server-only logic: controller -> repository -> model
  types.ts                SECTIONS registry + all content types (single source of truth)
  controllers/            Validate/sanitize, orchestrate (content, media)
  repository/             Data access (Mongo or JSON file), no business rules
  models/                 Mongoose schemas (content, media)
  lib/                    auth, mongodb connection
  data/content.json       Seed content (+ the store when no MONGODB_URI)

frontend/                 Client/presentation, no data access
  components/
    layout/               navbar, footer
    sections/             one file per landing section + detail pages
    ui/                   reusable primitives (button, badge, theme-toggle, ...)
    providers/            smooth-scroll
  lib/                    data, fonts, icons, theme, utils (browser-safe helpers)
```

The `@/*`, `@/components/*`, `@/lib/*` path aliases are defined in `tsconfig.json`.

## Content & data model

All editable content lives in **one** MongoDB document in the `content`
collection (`{ key: "landing", data: { ...all sections... } }`). This is a
deliberate choice for a single-tenant site: the whole page is read in one round
trip, edits are atomic, and there are no joins. The read is memoised per request
(`getContent` uses React `cache()`), so the layout, page, and metadata share a
single database call.

Uploaded images are **not** stored inline. They live in their own `media`
collection and are served from `/api/media/<id>` with immutable cache headers
(or as files under `public/uploads` in local dev). This keeps the content
document small and lets images be cached hard by the browser/CDN. The admin
"Optimize images" button migrates any older inline images into this store.

Adding a new section is data-driven: add an entry to `SECTIONS` in
`backend/types.ts` and it automatically appears in the admin with the right
fields — no new API or repository code needed.

## Deployment

1. Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in the host's environment.
2. `npm run build && npm run start` (or deploy to Vercel).
3. On a read-only host (e.g. Vercel), image uploads require `MONGODB_URI` — the
   `public/uploads` file fallback only works where the filesystem is writable.
```
