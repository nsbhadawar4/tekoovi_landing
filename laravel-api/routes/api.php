<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MediaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
|
| These mirror the Next.js App Router endpoints they replace, path for path,
| so the existing frontend only had to change which host it talks to:
|
|   POST   /api/admin/login          <- app/api/admin/login/route.ts
|   DELETE /api/admin/login
|   GET    /api/admin/session        (new: lets the server-rendered admin page
|                                     check a cookie it was handed)
|   GET    /api/content              (new: whole document, visibility applied)
|   GET    /api/content/{section}    <- app/api/content/[section]/route.ts
|   POST   /api/content/{section}
|   PUT    /api/content/{section}
|   PUT    /api/content/{section}/{id}   <- app/api/content/[section]/[id]/route.ts
|   DELETE /api/content/{section}/{id}
|   POST   /api/media                <- app/api/media/route.ts
|   GET    /api/media/{id}           <- app/api/media/[id]/route.ts
|   POST   /api/media/migrate        <- app/api/media/migrate/route.ts
|   GET    /api/health               <- app/api/health/route.ts
|
| Anything that changes content sits behind the `admin` middleware, exactly as
| `isAuthed()` guarded the routes before.
|
*/

/* ----------------------------- public ------------------------------- */

Route::get('/health', HealthController::class);

Route::get('/content', [ContentController::class, 'all']);
Route::get('/content/{section}', [ContentController::class, 'show']);

Route::get('/media/{id}', [MediaController::class, 'show']);

/* ------------------------------ auth -------------------------------- */

// Login is rate limited: five attempts a minute per IP is plenty for one
// operator and closes the door on credential stuffing.
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/admin/login', [AuthController::class, 'login']);
});

Route::delete('/admin/login', [AuthController::class, 'logout']);
Route::get('/admin/session', [AuthController::class, 'session']);

/* --------------------------- admin only ----------------------------- */

Route::middleware('admin')->group(function () {
    Route::post('/content/{section}', [ContentController::class, 'store']);
    Route::put('/content/{section}', [ContentController::class, 'update']);
    Route::put('/content/{section}/{id}', [ContentController::class, 'updateItem']);
    Route::delete('/content/{section}/{id}', [ContentController::class, 'destroyItem']);

    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::post('/media/migrate', [MediaController::class, 'migrate']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);
});
