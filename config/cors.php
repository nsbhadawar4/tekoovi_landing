<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing
|--------------------------------------------------------------------------
|
| One application serves the pages and the data, so nothing the site needs is
| cross-origin any more and no browser preflight has to be answered. The empty
| path list switches CORS handling off entirely.
|
| Only /api/media/{id} and /api/health are reachable from outside a page, and
| both are public, credential-free GETs. Add 'api/*' to `paths` (and the
| origins alongside it) if you ever put another front end in front of them.
|
*/

return [

    'paths' => [],

    'allowed_methods' => ['GET', 'OPTIONS'],

    'allowed_origins' => [],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Accept', 'Content-Type'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // Session cookies never leave this origin.
    'supports_credentials' => false,
];
