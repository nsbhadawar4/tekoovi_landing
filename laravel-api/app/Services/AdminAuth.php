<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Admin authentication.
 *
 * The Node backend stored a SHA-256 of "email:password" in an httpOnly cookie
 * and re-derived it to check a request. That scheme is kept — so sessions
 * created before this migration keep working — with two additions:
 *
 *   - the password may be stored as a bcrypt hash instead of plaintext
 *   - the same token is accepted as a Bearer header, for deployments where the
 *     API and the site are on different sites and cookies can't be shared
 */
class AdminAuth
{
    /** The value that proves a session. Tied to the configured credentials. */
    public function token(): string
    {
        return hash('sha256', $this->email().':'.$this->passwordFingerprint());
    }

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

    /** Does this request carry a valid session? */
    public function check(Request $request): bool
    {
        $presented = $request->cookie(config('admin.cookie'))
            ?? $request->bearerToken();

        return is_string($presented) && hash_equals($this->token(), $presented);
    }

    public function email(): string
    {
        return (string) config('admin.email', '');
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

    /**
     * What goes into the token alongside the email.
     *
     * With a plaintext password this is the password itself — identical to the
     * Node scheme, so existing cookies validate. With a hash it's the hash, so
     * the secret is never derivable from the cookie.
     */
    private function passwordFingerprint(): string
    {
        $hash = config('admin.password_hash');

        return is_string($hash) && $hash !== ''
            ? $hash
            : (string) config('admin.password', '');
    }
}
