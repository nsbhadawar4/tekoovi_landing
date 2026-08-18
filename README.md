# Tekoovi

The Tekoovi site and its content studio, as one Laravel application backed by
MongoDB. Blade renders every public page and the admin panel; PHP is the only
runtime the server needs.

```
Browser  →  Laravel route  →  Controller  →  MongoDB  →  Blade view  →  Browser
```

## Requirements

- PHP 8.3+ with the `mongodb` extension
- Composer
- A MongoDB database (Atlas or self-hosted)
- Node 20.19+ — **build time only**, to compile CSS/JS. Production never runs it.

## Running it locally

```bash
composer install
cp .env.example .env
php artisan key:generate

# Point it at your database and set the admin credentials.
#   MONGODB_URI, MONGODB_DATABASE
#   ADMIN_EMAIL, and ADMIN_PASSWORD_HASH from:
php artisan admin:hash "your-password"

npm install
npm run build          # writes public/build

php artisan serve      # http://localhost:8000
```

The site is at `/`, the content studio at `/admin`.

While working on the front end, `npm run dev` replaces `npm run build` and
hot-reloads CSS and JS.

### A fresh database

Reads never write, so pointing the app at an empty database serves the bundled
content in `resources/data/content.json` without creating anything. Plant it
deliberately when you're ready:

```bash
php artisan content:seed
```

## Deploying

The build output is committed-or-CI-built static files, so a deploy is a PHP
deploy:

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build        # or build in CI and ship public/build
php artisan config:cache && php artisan route:cache && php artisan view:cache
```

Point the web server's document root at `public/`. Set `APP_ENV=production`,
`APP_DEBUG=false` and `SESSION_SECURE_COOKIE=true`, and make sure `storage/` is
writable (sessions, cache and logs live there).

There is no Node process, no second deployment and no separate API host.

## How it fits together

| Path | What lives there |
|---|---|
| `routes/web.php` | every public URL and the admin panel |
| `routes/api.php` | only `/api/media/{id}` (image bytes) and `/api/health` |
| `config/sections.php` | the content registry — sections, fields, page blocks |
| `app/Support/Sections.php` | the rules over that registry |
| `app/Services/ContentService.php` | coercion, validation and field visibility |
| `app/Repositories/ContentRepository.php` | the single `content` document |
| `app/Services/MediaService.php` | uploads, stored in the `media` collection |
| `resources/views/pages/` | one view per public page |
| `resources/views/sections/` | the landing page, block by block |
| `resources/views/admin/` | the content studio |

Content is one MongoDB document keyed `landing`; images are their own documents
in `media` and are served from `/api/media/{id}`.

### Editing content

Everything on the site is editable at `/admin`. Two controls shape what visitors
see:

- **Field visibility** — switch any field to *Hidden* and it is blanked before
  the page is rendered, so it never reaches the browser. The stored value is
  kept, so switching it back on restores it.
- **Page sections** — switch a whole landing-page block off from the *Page
  Sections* panel, or from the toolbar of the section that fills it.

## Commands

```bash
php artisan admin:hash "password"   # bcrypt hash for ADMIN_PASSWORD_HASH
php artisan content:seed            # plant the bundled content (--force to overwrite)
php artisan content:repair          # strip junk keys left by the old array cast
php artisan test
```
