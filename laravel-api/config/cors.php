<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing
|--------------------------------------------------------------------------
|
| The Next.js site runs on its own origin and calls this API from the browser,
| including the admin panel's authenticated requests — so credentials must be
| allowed and the origins listed explicitly (a wildcard is not permitted
| alongside credentials, and shouldn't be used in production anyway).
|
| Set FRONTEND_URL to the site's origin. FRONTEND_URLS takes a comma-separated
| list when there is more than one (staging, preview deploys, www and apex).
|
*/

$origins = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('FRONTEND_URLS', (string) env('FRONTEND_URL', 'http://localhost:3000'))),
)));

return [

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $origins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // The admin session travels as an httpOnly cookie.
    'supports_credentials' => true,
];
