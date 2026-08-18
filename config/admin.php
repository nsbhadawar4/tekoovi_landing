<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin credentials
    |--------------------------------------------------------------------------
    |
    | A single operator, exactly as the Node backend had it. Prefer
    | ADMIN_PASSWORD_HASH (a bcrypt hash — generate one with
    | `php artisan admin:hash "your-password"`); ADMIN_PASSWORD is the plaintext
    | fallback that keeps existing installs working unchanged.
    |
    */

    'email' => env('ADMIN_EMAIL'),

    'password' => env('ADMIN_PASSWORD'),

    'password_hash' => env('ADMIN_PASSWORD_HASH'),

    /*
    |--------------------------------------------------------------------------
    | Session cookie
    |--------------------------------------------------------------------------
    |
    | Same name and shape the Next.js backend used, so a browser that is already
    | signed in stays signed in. `same_site` can be relaxed to "none" (which
    | forces Secure) when the API and the site sit on genuinely different sites.
    |
    */

    'cookie' => env('ADMIN_COOKIE', 'admin_session'),

    'lifetime_minutes' => (int) env('ADMIN_SESSION_MINUTES', 60 * 24 * 7),

    'cookie_domain' => env('ADMIN_COOKIE_DOMAIN'),

    'cookie_secure' => env('ADMIN_COOKIE_SECURE', false),

    'cookie_same_site' => env('ADMIN_COOKIE_SAME_SITE', 'lax'),
];
