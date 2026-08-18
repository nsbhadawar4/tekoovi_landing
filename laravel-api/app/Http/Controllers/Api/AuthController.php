<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AdminAuth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class AuthController extends Controller
{
    public function __construct(private readonly AdminAuth $auth) {}

    /**
     * POST /api/admin/login — { email, password } -> sets the session cookie.
     *
     * Response shape matches the Node route exactly: `{ok: true}` on success,
     * `{ok: false, error}` with a 401 otherwise.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! $this->auth->verify($request->input('email'), $request->input('password'))) {
            return response()->json([
                'ok' => false,
                'error' => 'Wrong email or password.',
            ], 401);
        }

        $token = $this->auth->token();

        return response()
            ->json(['ok' => true, 'token' => $token])
            ->withCookie($this->sessionCookie($token, config('admin.lifetime_minutes')));
    }

    /** DELETE /api/admin/login — clears the cookie. */
    public function logout(): JsonResponse
    {
        return response()
            ->json(['ok' => true])
            ->withCookie($this->sessionCookie('', -1));
    }

    /**
     * GET /api/admin/session — is this browser signed in?
     *
     * The admin page is server-rendered by Next.js, which needs a way to check
     * the cookie it was handed before deciding to render the dashboard.
     */
    public function session(Request $request): JsonResponse
    {
        if (! $this->auth->check($request)) {
            return response()->json(['authenticated' => false], 401);
        }

        return response()->json([
            'authenticated' => true,
            'email' => $this->auth->email(),
        ]);
    }

    /** httpOnly cookie, same name and options the Node backend used. */
    private function sessionCookie(string $value, int $minutes): \Symfony\Component\HttpFoundation\Cookie
    {
        return Cookie::make(
            name: config('admin.cookie'),
            value: $value,
            minutes: $minutes,
            path: '/',
            domain: config('admin.cookie_domain'),
            secure: (bool) config('admin.cookie_secure'),
            httpOnly: true,
            raw: false,
            sameSite: config('admin.cookie_same_site'),
        );
    }
}
