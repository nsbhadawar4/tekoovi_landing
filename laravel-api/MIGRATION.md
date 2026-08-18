# Backend migration — Next.js/Node → Laravel + MongoDB

The Next.js frontend is unchanged. Only the backend moved: Laravel now owns the
database, the business logic and every API endpoint.

```
Next.js frontend (:3000)  ──REST──▶  Laravel API (:8000)  ──▶  MongoDB (tekoovi)
```

The database was **not** migrated: Laravel reads and writes the same cluster,
the same `content` and `media` collections, and the same document shapes —
including Mongoose's `createdAt` / `updatedAt` field names.

---

## Endpoint map

| Old Next.js route | New Laravel route | Auth | Response |
|---|---|---|---|
| `POST /api/admin/login` | same | public (5/min) | `{ok:true, token}` · 401 `{ok:false,error}` |
| `DELETE /api/admin/login` | same | public | `{ok:true}` |
| — | `GET /api/admin/session` | public | `{authenticated}` · 401 |
| — | `GET /api/content` | public | `{data}` — whole document, visibility applied |
| `GET /api/content/[section]` | same | public | `{item}` or `{items}` · 404 `{error}` |
| `POST /api/content/[section]` | same | admin | 201 `{item}` · 400 `{error}` |
| `PUT /api/content/[section]` | same | admin | `{item}` |
| `PUT /api/content/[section]/[id]` | same | admin | `{item}` · 404 `{error}` |
| `DELETE /api/content/[section]/[id]` | same | admin | `{ok:true}` · 404 |
| `POST /api/media` | same | admin | 201 `{url}` · 400/422 `{error}` |
| `GET /api/media/[id]` | same | public | image bytes, immutable cache |
| `POST /api/media/migrate` | same | admin | `{replaced:n}` |
| — | `GET /api/media` | admin | `{items}` — media listing |
| — | `DELETE /api/media/{id}` | admin | `{ok:true}` |
| `GET /api/health` | same | public | `{success,mongo,hasUri}` |

`GET /api/content` is the only addition the frontend depends on: it replaces the
direct database read the Next server used to do, and it is where field
visibility is applied.

## Where the logic went

| Node file | Laravel equivalent |
|---|---|
| `backend/types.ts` (SECTIONS) | `config/sections.php` + `app/Support/Sections.php` |
| `backend/lib/mongodb.ts` | `config/database.php` (`mongodb` connection) |
| `backend/lib/auth.ts` | `app/Services/AdminAuth.php`, `app/Http/Middleware/EnsureAdmin.php` |
| `backend/models/*.model.ts` | `app/Models/Content.php`, `app/Models/Media.php` |
| `backend/repository/content.repository.ts` | `app/Repositories/ContentRepository.php` |
| `backend/repository/media.repository.ts` | `app/Services/MediaService.php` |
| `backend/controllers/content.controller.ts` | `app/Services/ContentService.php` |
| `backend/controllers/media.controller.ts` | `MediaService::migrateInlineImages()` |
| `backend/data/content.json` | `resources/data/content.json` (seed only) |

Behaviour preserved exactly: field coercion by type, "at least one field"
validation on create, unknown fields dropped, `hiddenFields` accepted as a
comma-joined string or an array, hidden values blanked for the public site but
kept in storage, and Node-format item ids (`x…`).

## Media URLs

Documents keep storing `/api/media/<id>`, exactly as before. The API rewrites
them to absolute URLs on read (`MEDIA_BASE_URL`) and folds them back to relative
on write — so no component changed, no stored data changed, and moving the API
to another domain is a config change.

## Frontend changes (API connection only)

| File | Change |
|---|---|
| `frontend/lib/api.ts` | **new** — `API_BASE`, `apiUrl`, `apiFetch`, `apiSend` |
| `backend/controllers/content.controller.ts` | `getContent()` now fetches `GET /api/content` |
| `app/admin/dashboard.tsx` | 11 `fetch("/api/…")` calls → `apiFetch`/`apiSend` |
| `app/admin/login/page.tsx` | login call → `apiSend` |
| `app/admin/page.tsx` | server-side auth check → `GET /api/admin/session` |
| `app/not-found.tsx` | marked dynamic (reads live contact details) |
| `.env.local` | `NEXT_PUBLIC_API_URL=http://localhost:8000/api` |

No component, style, layout, animation or route was touched.

## Old backend — safe to delete once you're happy

Still in the tree as reference, no longer used by the frontend:

```
app/api/admin/login/route.ts
app/api/content/[section]/route.ts
app/api/content/[section]/[id]/route.ts
app/api/media/route.ts
app/api/media/[id]/route.ts
app/api/media/migrate/route.ts
app/api/health/route.ts
backend/lib/mongodb.ts
backend/models/content.model.ts
backend/models/media.model.ts
backend/repository/content.repository.ts
backend/repository/media.repository.ts
backend/controllers/media.controller.ts
```

Keep for now:

- `backend/types.ts` — still drives the **admin UI** (labels, field types, page
  blocks) and the frontend's TypeScript types.
- `backend/controllers/content.controller.ts` — `getContent()` lives here.
- `backend/data/content.json` — used as the offline fallback.
- `backend/lib/auth.ts` — unused by the app, but the specification the PHP port
  was written against.

Once deleted, `mongoose` and `dotenv` can come out of `package.json`.

## Running it

```bash
# API
cd laravel-api
composer install
cp .env.example .env          # fill in MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD
php artisan key:generate
php artisan serve --port=8000

# Frontend (unchanged)
npm run dev                   # http://localhost:3000
```

Requires the MongoDB PHP extension (`ext-mongodb`). Check with `php -m | grep mongodb`.

Fresh database only: `php artisan content:seed` plants the starting content.
Reads never write, so pointing at an empty database is safe.

```bash
php artisan test              # 12 contract tests against the real database
php artisan admin:hash "…"    # bcrypt hash for ADMIN_PASSWORD_HASH
```

## Production notes

- Set `APP_DEBUG=false`; errors return JSON without stack traces.
- `FRONTEND_URL` (or `FRONTEND_URLS`, comma separated) drives CORS. Credentials
  are allowed, so origins must be listed explicitly — no wildcard.
- Over HTTPS set `ADMIN_COOKIE_SECURE=true`. If the API and the site are on
  different sites (not just different ports/subdomains), set
  `ADMIN_COOKIE_SAME_SITE=none`; the login response also returns the token for
  `Authorization: Bearer` use.
- Prefer `ADMIN_PASSWORD_HASH` over `ADMIN_PASSWORD`.
- `MEDIA_BASE_URL` must be the API's public origin.
