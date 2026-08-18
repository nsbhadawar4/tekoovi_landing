<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AdminAuth;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Admin sign-in.
 *
 * The whole flow is server-rendered now: the form posts to Laravel, the
 * credentials are checked against the environment, and a session is started.
 * No token is handed to the browser, and the login POST is rate limited in
 * routes/web.php — five attempts a minute per IP is plenty for one operator and
 * closes the door on credential stuffing.
 */
class AuthController extends Controller
{
    public function __construct(private readonly AdminAuth $auth) {}

    /** GET /admin/login */
    public function show(Request $request): View|RedirectResponse
    {
        if ($this->auth->check($request)) {
            return redirect()->route('admin.dashboard');
        }

        return view('admin.login', [
            'configured' => $this->auth->isConfigured(),
        ]);
    }

    /** POST /admin/login */
    public function login(LoginRequest $request): RedirectResponse
    {
        if (! $this->auth->verify($request->input('email'), $request->input('password'))) {
            return back()
                ->withInput($request->only('email'))
                ->withErrors(['email' => 'Wrong email or password.']);
        }

        $this->auth->login($request);

        return redirect()->intended(route('admin.dashboard'));
    }

    /** POST /admin/logout */
    public function logout(Request $request): RedirectResponse
    {
        $this->auth->logout($request);

        return redirect()->route('admin.login');
    }
}
