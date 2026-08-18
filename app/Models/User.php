<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use MongoDB\Laravel\Auth\User as Authenticatable;

/**
 * A user document in the existing `users` collection.
 *
 * Admin access does **not** go through this model: the operator's credentials
 * come from the environment (see App\Services\AdminAuth), exactly as the Node
 * backend worked. This exists so the Laravel auth scaffolding points at a model
 * that can actually talk to MongoDB — and as the starting point if you ever want
 * database-backed logins.
 */
class User extends Authenticatable
{
    use Notifiable;

    protected $connection = 'mongodb';

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
