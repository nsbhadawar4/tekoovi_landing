<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Admin credentials
    |--------------------------------------------------------------------------
    |
    | A single operator, whose credentials live in the environment rather than
    | the database.
    |
    | Prefer ADMIN_PASSWORD_HASH — a bcrypt hash, which you generate with
    |
    |     php artisan admin:hash "your-password"
    |
    | and paste into .env. ADMIN_PASSWORD is a plaintext fallback that keeps an
    | older install working; set one or the other, never both.
    |
    | The sign-in itself is an ordinary Laravel session (see App\Services\
    | AdminAuth), so the cookie's name, lifetime and flags come from
    | config/session.php like every other session in the app.
    |
    */

    'email' => env('ADMIN_EMAIL'),

    'password' => env('ADMIN_PASSWORD'),

    'password_hash' => env('ADMIN_PASSWORD_HASH'),
];
