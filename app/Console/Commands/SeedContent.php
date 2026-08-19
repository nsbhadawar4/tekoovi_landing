<?php

namespace App\Console\Commands;

use App\Models\Content;
use Illuminate\Console\Command;

/**
 * Plants the starting content on a fresh database.
 *
 * Deliberately a manual step: reads never write, so pointing the app at an
 * empty database shows the bundled content without ever creating a record
 * beside real data. `php artisan db:seed` does the same thing (see
 * Database\Seeders\ContentSeeder); this command is what you reach for to
 * overwrite with --force.
 */
class SeedContent extends Command
{
    protected $signature = 'content:seed {--force : Overwrite the existing document}';

    protected $description = 'Seed the content record from resources/data/content.json';

    public function handle(): int
    {
        $path = resource_path('data/content.json');

        if (! is_file($path)) {
            $this->error("Seed file not found: {$path}");

            return self::FAILURE;
        }

        $existing = Content::query()->where('key', Content::LANDING)->first();

        if ($existing && ! $this->option('force')) {
            $this->warn('Content already exists — nothing written. Pass --force to overwrite it.');

            return self::SUCCESS;
        }

        $data = json_decode(file_get_contents($path), true);

        if (! is_array($data)) {
            $this->error('Seed file is not valid JSON.');

            return self::FAILURE;
        }

        Content::query()->updateOrCreate(['key' => Content::LANDING], ['data' => $data]);

        $this->info($existing ? 'Content overwritten from seed.' : 'Content seeded.');

        return self::SUCCESS;
    }
}
