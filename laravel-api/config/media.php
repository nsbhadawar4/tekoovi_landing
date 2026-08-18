<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Public base URL for media
    |--------------------------------------------------------------------------
    |
    | Images are served by this API from /api/media/{id}. Content documents keep
    | storing the relative path, and reads prefix it with this value — so moving
    | the API to another domain (or putting a CDN in front of it) is a config
    | change, not a data migration.
    |
    */

    'base_url' => env('MEDIA_BASE_URL', env('APP_URL', 'http://localhost:8000')),

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
