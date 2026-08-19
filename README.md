# Tekoovi

The Tekoovi site and its content studio, as one Laravel application backed by
MySQL. Blade renders every public page and the admin panel; PHP is the only
runtime the server needs.

```
Browser  →  Laravel route  →  Controller  →  MySQL  →  Blade view  →  Browser
```

## Requirements

- PHP 8.3+ with `pdo_mysql`
- Composer
- MySQL 5.7+ / MariaDB 10.3+ (WAMP, XAMPP or any shared host will do)
- Node 20.19+ — **build time only**, to compile CSS/JS. Production never runs it.

## Running it locally

```bash
composer install
cp .env.example .env
php artisan key:generate

# Point it at your database and set the admin credentials.
#   DB_DATABASE, DB_USERNAME, DB_PASSWORD
#   ADMIN_EMAIL, and ADMIN_PASSWORD_HASH from:
php artisan admin:hash "your-password"

# Create the database first (WAMP: root, no password)
#   mysql -u root -e "CREATE DATABASE tekoovi CHARACTER SET utf8mb4"
php artisan migrate
php artisan storage:link   # serves storage/app/public at /storage

npm install
npm run build          # writes public/build

php artisan serve      # http://localhost:8000
```

The site is at `/`, the content studio at `/admin`.

While working on the front end, `npm run dev` replaces `npm run build` and
hot-reloads CSS and JS.

### A fresh database

`php artisan migrate` creates the schema. Reads never write, so an empty database
serves the bundled content in `resources/data/content.json` without creating
anything — plant it deliberately when you're ready:

```bash
php artisan db:seed        # the admin user row + the bundled content
# or just the content:
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

Then `php artisan migrate --force` and `php artisan storage:link` once on the
host.

Point the web server's document root at `public/`. Set `APP_ENV=production`,
`APP_DEBUG=false` and `SESSION_SECURE_COOKIE=true`, and make sure `storage/` is
writable (sessions, cache, logs and uploaded images live there).

There is no Node process, no second deployment and no separate API host.

## How it fits together

| Path | What lives there |
|---|---|
| `routes/web.php` | every public URL and the admin panel |
| `routes/api.php` | only `/api/media/{id}` (image bytes) and `/api/health` |
| `config/sections.php` | the content registry — sections, fields, page blocks |
| `app/Support/Sections.php` | the rules over that registry |
| `app/Services/ContentService.php` | coercion, validation and field visibility |
| `app/Repositories/ContentRepository.php` | the single `content` row |
| `app/Services/MediaService.php` | uploads: files on disk, metadata in `media` |
| `resources/views/pages/` | one view per public page |
| `resources/views/sections/` | the landing page, block by block |
| `resources/views/admin/` | the content studio |

Content is one row in `content` keyed `landing`, its whole section tree in a JSON
column — the registry decides the shape, so a new section needs no migration.
Uploaded images are written to `storage/app/public/media/`, with their mime type,
path and size in the `media` table, and are served from `/api/media/{id}`. Those
ids are 24 hex characters and are part of the stored content, so they never
change.

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
php artisan migrate                 # create the schema
php artisan db:seed                 # admin user row + bundled content (idempotent)
php artisan storage:link            # expose storage/app/public at /storage
php artisan admin:hash "password"   # bcrypt hash for ADMIN_PASSWORD_HASH
php artisan content:seed            # plant the bundled content (--force to overwrite)
php artisan content:repair          # normalise a record imported from the old database
php artisan test
```

## Coming from the MongoDB build?

The database layer moved to MySQL; every route, view and admin screen is
unchanged. To bring an old database across, set `MONGODB_URI` and
`MONGODB_DATABASE` in `.env`, then:

```bash
php artisan migrate
php artisan app:migrate-mongodb-to-mysql --dry-run   # see what it would import
php artisan app:migrate-mongodb-to-mysql
```

It keeps every media id, so the `/api/media/<id>` paths already inside your
content keep resolving, writes the image bytes into `storage/app/public/media/`,
and never modifies or deletes anything in MongoDB. It needs the `mongodb` PHP
extension while it runs, and nothing after that — the Composer package is gone.
