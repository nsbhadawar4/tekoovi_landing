<?php

namespace App\Http\Middleware;

use App\Services\AdminAuth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate for the admin panel and everything it can change.
 *
 * A browser asking for a page is sent to the sign-in screen; an XHR from the
 * panel (image upload, a visibility switch) gets the JSON shape the admin
 * script already handles, so a session that expires mid-edit surfaces as a
 * toast rather than an HTML error page rendered into a fetch handler.
 */
class EnsureAdmin
{
    public function __construct(private readonly AdminAuth $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->auth->check($request)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return redirect()->route('admin.login');
    }
}
