<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| This project is a JSON API — the Next.js app owns every page. The root is
| kept only so hitting the API's host in a browser says something useful
| instead of an error.
|
*/

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'ok',
    'docs' => 'See routes/api.php — everything lives under /api.',
]));
