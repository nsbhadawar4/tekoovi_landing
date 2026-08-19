<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public base URL for media
    |--------------------------------------------------------------------------
    |
    | Images are served by this app from /api/media/{id}, and content documents
    | store that path relative. Leaving this empty (the default) keeps the
    | rendered markup relative too, so the same database works on localhost, a
    | staging domain and production with no migration.
    |
    | Set it only to serve images from somewhere else — a CDN or an image host
    | in front of the app — and every stored path is prefixed with it on read.
    |
    */

    'base_url' => env('MEDIA_BASE_URL', ''),

    /*
    |--------------------------------------------------------------------------
    | Where the bytes live
    |--------------------------------------------------------------------------
    |
    | Uploads are written to `<directory>/<id>.<ext>` on this disk, and MySQL
    | keeps only the metadata — mime type, path and size. The `public` disk is
    | storage/app/public, which `php artisan storage:link` exposes at /storage,
    | so the files can be served straight off disk by Apache if you ever want
    | that; the app itself serves them through /api/media/{id} either way.
    |
    */

    'disk' => env('MEDIA_DISK', 'public'),

    'directory' => env('MEDIA_DIRECTORY', 'media'),

    /*
    |--------------------------------------------------------------------------
    | Upload limits
    |--------------------------------------------------------------------------
    */

    'max_bytes' => (int) env('MEDIA_MAX_BYTES', 8 * 1024 * 1024),

    'allowed_types' => [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/gif',
        'image/avif',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache header for served images
    |--------------------------------------------------------------------------
    |
    | Bytes at a given id never change (a new upload gets a new id), so they can
    | be cached hard by browsers and CDNs.
    |
    */

    'cache_control' => env('MEDIA_CACHE_CONTROL', 'public, max-age=31536000, immutable'),
];
