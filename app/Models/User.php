<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * A row in the `users` table.
 *
 * Admin access does **not** go through this model: the operator's credentials
 * come from the environment (see App\Services\AdminAuth), exactly as they did
 * before — the sign-in screen and flow are unchanged. This exists so the Laravel
 * auth scaffolding points at a model backed by MySQL, and so the seeded admin
 * row is there as the starting point if you ever want database-backed logins.
 */
class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'users';

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
