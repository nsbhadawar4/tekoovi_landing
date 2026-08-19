<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The tables Laravel's own auth scaffolding needs.
 *
 * The admin sign-in itself still reads its credentials from the environment
 * (see App\Services\AdminAuth), exactly as it did before the move off MongoDB —
 * the flow and the screen are unchanged. `users` exists because config/auth.php
 * points the eloquent provider at App\Models\User, and because the admin
 * operator is seeded into it (see Database\Seeders\AdminUserSeeder) so a
 * database-backed login is a configuration change rather than a rewrite.
 *
 * `sessions` is created even though SESSION_DRIVER defaults to `file`, so
 * switching the driver on shared hosting needs no extra migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
