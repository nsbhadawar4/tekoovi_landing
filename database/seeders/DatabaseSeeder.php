<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Both seeders are idempotent — nothing already in the database is
     * overwritten — so `php artisan db:seed` is safe to re-run.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            ContentSeeder::class,
        ]);
    }
}
