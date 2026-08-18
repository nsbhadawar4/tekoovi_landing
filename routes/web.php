<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| One Laravel application serves the whole site. Every public URL the Next.js
| app answered is answered here, path for path, so nothing that already links
| into the site breaks:
|
|   /                              <- app/(site)/page.tsx
|   /blog                          <- app/(site)/blog/page.tsx
|   /blog/{slug}                   <- app/(site)/blog/[slug]/page.tsx
|   /work-detail/{slug}            <- app/(site)/work-detail/[slug]/page.tsx
|   /case-study-detail/{slug}      <- app/(site)/case-study-detail/[slug]/page.tsx
|   /privacy                       <- app/(site)/privacy/page.tsx
|   /terms                         <- app/(site)/terms/page.tsx
|   /admin, /admin/login           <- app/admin/**
|
*/

/* ------------------------------ public ------------------------------- */

Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/blog', [PageController::class, 'blog'])->name('blog');
Route::get('/blog/{slug}', [PageController::class, 'blogPost'])->name('blog.show');

Route::get('/work-detail/{slug}', [PageController::class, 'workDetail'])->name('work.show');
Route::get('/case-study-detail/{slug}', [PageController::class, 'caseStudyDetail'])->name('case-study.show');

// The legal pages differ only in which two content sections they read.
Route::get('/{page}', [PageController::class, 'legal'])
    ->whereIn('page', ['privacy', 'terms'])
    ->name('legal');

// The Next.js config redirected /work/:slug permanently; keep honouring it.
Route::permanentRedirect('/work/{slug}', '/work-detail/{slug}');

/* ------------------------------- admin ------------------------------- */

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AuthController::class, 'show'])->name('login');

    // Five attempts a minute per IP is plenty for one operator and closes the
    // door on credential stuffing.
    Route::post('login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login.attempt');

    Route::middleware('admin')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');

        Route::get('/', [ContentController::class, 'index'])->name('dashboard');
        Route::get('section/{section}', [ContentController::class, 'index'])->name('section');

        Route::post('section/{section}', [ContentController::class, 'store'])->name('section.store');
        Route::put('section/{section}', [ContentController::class, 'update'])->name('section.update');
        Route::put('section/{section}/{id}', [ContentController::class, 'updateItem'])->name('section.item.update');
        Route::delete('section/{section}/{id}', [ContentController::class, 'destroyItem'])->name('section.item.destroy');

        // Answers JSON — the toolbar switch flips without a reload.
        Route::post('blocks', [ContentController::class, 'toggleBlock'])->name('blocks.toggle');

        Route::get('media', [MediaController::class, 'index'])->name('media');
        Route::post('media', [MediaController::class, 'store'])->name('media.store');
        Route::post('media/migrate', [MediaController::class, 'migrate'])->name('media.migrate');
        Route::delete('media/{id}', [MediaController::class, 'destroy'])->name('media.destroy');
    });
});
