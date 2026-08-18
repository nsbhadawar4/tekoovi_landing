# Migration — Next.js + Laravel API → one Laravel application

The project used to be three parts: a Next.js site, a Node backend, and a
Laravel API added later. It is now a single Laravel application. The design and
the content are unchanged; what went away is the second runtime, the second
deployment and the HTTP hop between them.

```
Before   Next.js (:3000) ──REST──▶ Laravel API (:8000) ──▶ MongoDB
After    Laravel (:8000) ────────────────────────────────▶ MongoDB
```

The database was **not** migrated. The same cluster, the same `content` and
`media` collections, the same document shapes — including Mongoose's
`createdAt` / `updatedAt` field names and the `"x…"` item id format.

---

## Pages

| Next.js | Laravel |
|---|---|
| `app/(site)/page.tsx` | `resources/views/pages/home.blade.php` |
| `app/(site)/blog/page.tsx` | `resources/views/pages/blog-index.blade.php` |
| `app/(site)/blog/[slug]/page.tsx` | `resources/views/pages/blog-detail.blade.php` |
| `app/(site)/work-detail/[slug]/page.tsx` | `resources/views/pages/work-detail.blade.php` |
| `app/(site)/case-study-detail/[slug]/page.tsx` | `resources/views/pages/case-study-detail.blade.php` |
| `app/(site)/privacy/page.tsx`, `terms/page.tsx` | `resources/views/pages/legal.blade.php` |
| `app/not-found.tsx` | `resources/views/errors/404.blade.php` |
| `app/layout.tsx` + `app/(site)/layout.tsx` | `resources/views/layouts/app.blade.php` |
| `app/admin/login/page.tsx` | `resources/views/admin/login.blade.php` |
| `app/admin/page.tsx` + `dashboard.tsx` | `resources/views/admin/dashboard.blade.php` |
| `app/admin/layout.tsx` | `resources/views/admin/layouts/app.blade.php` |
| — (new) | `resources/views/admin/media.blade.php` |

Every public URL is unchanged, including the permanent `/work/{slug}` →
`/work-detail/{slug}` redirect that `next.config.ts` used to serve.

## Components

Landing-page sections became `resources/views/sections/*.blade.php`, one per
block (`hero`, `trusted-by`, `featured-projects`, `services`, `industries`,
`why`, `process`, `tech-stack`, `case-studies`, `testimonials`, `founder`,
`blog-teaser`, `faq`).

Shared UI became Blade components in `resources/views/components/`: `button`,
`badge`, `container`, `section`, `section-heading`, `reveal`, `marquee`,
`carousel`, `image-slider`, `stars`, `avatar-stack`, `logo`, `icon`,
`social-glyph`, `aurora`, `grid-backdrop`, `blog-card`, `navbar`, `footer`,
`cta-band`, `theme-toggle`.

`frontend/lib/*` moved to `app/Support/`: `Site` (nav, slugs, hrefs, text
blocks), `Fonts`, `Icons`, `Sections`, `AdminForm`.

## Runtime behaviour without React

`resources/js/app.js` and `resources/js/admin.js` replace React and Framer
Motion with plain DOM code — roughly 1,200 lines against the ~10,000 lines of
TSX they stand in for:

| Was | Now |
|---|---|
| `motion` `whileInView` (`<Reveal>`, `<RevealGroup>`) | one `IntersectionObserver` + CSS transitions |
| `<WordReveal>` | words split into masked spans, staggered by a CSS variable |
| `useScroll` / `useTransform` hero parallax | one rAF-throttled scroll listener |
| `layoutId` nav pill and dot | one element translated between links |
| `useState` FAQ accordion | measured-height transitions |
| carousel / slider components | the same scroll-snap rail, scripted directly |
| `ImageCropper` (React) | the same canvas cropper, no framework |
| Lenis in a provider | Lenis imported directly in `app.js` |

`lenis` is the only remaining JavaScript dependency. Tailwind v4 and Vite build
the assets; the compiled output in `public/build` is what production serves.

## Backend

The Laravel service layer was already in place and was kept as-is:
`ContentService`, `ContentRepository`, `MediaService`, `MediaUrlService`,
`Sections`, and the `Content` / `Media` / `User` models.

What changed:

- **Routes.** The content and auth JSON endpoints are gone — nothing calls them
  now. `routes/api.php` keeps only `GET /api/media/{id}` (content documents
  store that exact path, so it is part of the data) and `GET /api/health`.
  Everything else is `routes/web.php` and returns HTML.
- **Auth.** Was a SHA-256 token in an httpOnly cookie shared across two origins;
  now an ordinary Laravel session. Nothing derived from the password reaches the
  browser, writes are CSRF-protected, and login is still rate limited to 5/min.
- **CORS.** Switched off — there is no second origin left to allow.
- **Media URLs.** `MEDIA_BASE_URL` now defaults to empty, so stored paths render
  relative and the same database works on any domain. Set it only for a CDN.
- **Admin UI source of truth.** `backend/types.ts` drove the admin forms and
  `config/sections.php` drove validation. They are one file now —
  `config/sections.php` carries labels, hints, placeholders, groups, icons and
  ordering alongside the field types.

## Two bugs found and fixed on the way

**The content document was carrying 24,385 junk keys.** `Content` had
`protected $casts = ['data' => 'array']`. That cast JSON-encodes on write, and
the encoded string reached MongoDB as one key per character (`"0" => "{"`,
`"1" => "\""`, …) sitting beside the real sections. Reads still worked — section
names always won — so the only symptom was a 466 KB document where 27 KB was
warranted, and every page paying for it: the landing page took **21 seconds** to
render.

The cast is gone (MongoDB stores nested structures natively), `content:repair`
cleans what it left behind, and the read/write path filters numeric top-level
keys so a stale document repairs itself on the next save. Page render dropped
from 21 s to **0.45 s**. All 23 sections were verified present before and after.

**Gradient headlines rendered blank.** `text-ink-gradient` clips a gradient to
its own text, but word-revealed headlines put each word inside an inline-block
mask — atomic boxes, not text runs — leaving the parent nothing to clip to. The
wrapper is now marked `data-word-gradient` and the gradient is painted per word.

## Removed

`app/` (Next.js App Router), `frontend/` (React components and libs),
`backend/` (the TypeScript backend), `.next/`, `next.config.ts`,
`next-env.d.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`,
`.env.local`, and the Next.js `package.json`.

## Kept deliberately

- `package.json` / `vite.config.js` — Tailwind and the site JS still need a
  build step. Node is a build-time tool; production runs PHP only.
- `resources/data/content.json` — the fallback the site serves when the database
  is unreachable, and the source for `content:seed`.
- `public/uploads/` — five images from the pre-MongoDB era. Nothing in the
  current content references them; kept in case an old link does.
- `caseStudy` / `caseMetrics` — editable in the admin but not rendered on the
  page. That was already true in the Next.js app; the parity is intentional.
