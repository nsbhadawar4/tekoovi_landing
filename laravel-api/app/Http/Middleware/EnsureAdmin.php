<?php

namespace App\Http\Middleware;

use App\Services\AdminAuth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gate for every content-changing endpoint.
 *
 * Returns the same JSON shape the Node backend returned — `{"error":
 * "Unauthorized"}` with a 401 — so the admin UI's existing "session expired"
 * handling keeps working untouched.
 */
class EnsureAdmin
{
    public function __construct(private readonly AdminAuth $auth) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->auth->check($request)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
