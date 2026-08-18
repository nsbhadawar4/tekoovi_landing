<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Admin authentication.
 *
 * A single operator whose credentials come from the environment, exactly as the
 * Node backend had it. What changed with the move to one Laravel app is where
 * the proof of a session lives: it used to be a SHA-256 token in an httpOnly
 * cookie the browser carried between two origins, and it is now an ordinary
 * Laravel session — nothing derived from the password ever reaches the browser,
 * and the session cookie is signed and rotated by the framework.
 *
 * The password may be stored as a bcrypt hash (preferred — generate one with
 * `php artisan admin:hash "your-password"`) or as plaintext, which keeps
 * existing installs working unchanged.
 */
class AdminAuth
{
    /** Session key holding the signed-in operator's email. */
    private const SESSION_KEY = 'admin.email';

    /** Both the email and the password must match. */
    public function verify(?string $email, ?string $password): bool
    {
        if (! is_string($email) || ! is_string($password) || $password === '') {
            return false;
        }

        $emailMatches = hash_equals(
            mb_strtolower($this->email()),
            mb_strtolower(trim($email)),
        );

        return $emailMatches && $this->passwordMatches($password);
    }

    /**
     * Start an authenticated session.
     *
     * The id is regenerated so a session fixed before login can't be reused
     * afterwards.
     */
    public function login(Request $request): void
    {
        $request->session()->regenerate();
        $request->session()->put(self::SESSION_KEY, $this->email());
    }

    /** End the session and invalidate its id and CSRF token. */
    public function logout(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    /**
     * Does this request carry a signed-in session?
     *
     * The stored email is compared against the configured one, so changing
     * ADMIN_EMAIL in the environment signs existing sessions out rather than
     * leaving them valid for an operator who no longer exists.
     */
    public function check(Request $request): bool
    {
        $signedIn = $request->session()->get(self::SESSION_KEY);

        return is_string($signedIn)
            && $this->email() !== ''
            && hash_equals($this->email(), $signedIn);
    }

    public function email(): string
    {
        return (string) config('admin.email', '');
    }

    /** Is the app configured well enough for anyone to sign in at all? */
    public function isConfigured(): bool
    {
        return $this->email() !== ''
            && ((string) config('admin.password', '') !== ''
                || (string) config('admin.password_hash', '') !== '');
    }

    /* ---------------------------- internals --------------------------- */

    private function passwordMatches(string $password): bool
    {
        $hash = config('admin.password_hash');

        if (is_string($hash) && $hash !== '') {
            return Hash::check($password, $hash);
        }

        $plain = (string) config('admin.password', '');

        return $plain !== '' && hash_equals($plain, $password);
    }
}
