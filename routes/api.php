<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\MediaStreamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
|
| The site is served by routes/web.php through ordinary controllers and Blade
| views, so the content and auth endpoints that existed for the separate
| Next.js frontend are gone — nothing calls them any more.
|
| Two stateless routes remain, both for good reasons:
|
|   GET /api/media/{id}   the bytes of an uploaded image. Every content
|                         document stores this exact path, so it is part of the
|                         data, not an implementation detail.
|   GET /api/health       an uptime probe for the host.
|
*/

Route::get('/media/{id}', MediaStreamController::class);

Route::get('/health', HealthController::class);
