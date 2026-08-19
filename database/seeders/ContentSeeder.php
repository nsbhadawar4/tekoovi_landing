<?php

namespace Database\Seeders;

use App\Models\Content;
use Illuminate\Database\Seeder;

/**
 * Plants the landing-page content on a fresh database.
 *
 * Same job as `php artisan content:seed`, wired into `db:seed` so a brand new
 * install is one migrate + one seed away from a working site. An existing record
 * is never overwritten — use `content:seed --force` for that.
 */
class ContentSeeder extends Seeder
{
    public function run(): void
    {
        if (Content::query()->where('key', Content::LANDING)->exists()) {
            $this->command?->line('Content already present — left as it is.');

            return;
        }

        $path = resource_path('data/content.json');

        if (! is_file($path)) {
            $this->command?->warn('Seed file not found: '.$path);

            return;
        }

        $data = json_decode((string) file_get_contents($path), true);

        if (! is_array($data)) {
            $this->command?->error('Seed file is not valid JSON — content not seeded.');

            return;
        }

        Content::query()->create(['key' => Content::LANDING, 'data' => $data]);

        $this->command?->info('Content seeded from resources/data/content.json ('.count($data).' sections).');
    }
}
