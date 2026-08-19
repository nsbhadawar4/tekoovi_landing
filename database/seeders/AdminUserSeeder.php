<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Puts the admin operator in the `users` table.
 *
 * The sign-in flow itself is unchanged: App\Services\AdminAuth still checks the
 * posted credentials against ADMIN_EMAIL and ADMIN_PASSWORD_HASH, so nothing
 * about the login screen or its behaviour depends on this row. It exists so the
 * operator is represented in MySQL — which is what makes switching to a
 * database-backed guard a config change later rather than a rewrite.
 *
 * Nothing is hardcoded. The email comes from the environment, and the password
 * comes from ADMIN_PASSWORD_HASH (already a bcrypt hash, stored as-is) or from
 * ADMIN_PASSWORD (hashed here). With neither set, an unusable random hash goes in
 * so the row can never be signed into by guessing.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = trim((string) config('admin.email', ''));

        if ($email === '') {
            $this->command?->warn('ADMIN_EMAIL is not set — no admin user seeded.');

            return;
        }

        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            $this->command?->line('Admin user '.$email.' already exists — left as it is.');

            return;
        }

        $user = new User;
        $user->name = 'Administrator';
        $user->email = $email;
        // setAttribute rather than ->password, so an already-bcrypt value from
        // the environment isn't hashed a second time by the model's cast.
        $user->setAttribute('password', $this->password());
        $user->save();

        $this->command?->info('Admin user seeded: '.$email);
    }

    /** A bcrypt hash for the seeded row, never a plaintext password. */
    private function password(): string
    {
        $hash = (string) config('admin.password_hash', '');

        if ($hash !== '') {
            return $hash;
        }

        $plain = (string) config('admin.password', '');

        if ($plain !== '') {
            return Hash::make($plain);
        }

        // No credential configured: seed something no one can sign in with.
        $this->command?->warn(
            'Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set — the seeded user gets an unusable password.'
        );

        return Hash::make(Str::random(48));
    }
}
