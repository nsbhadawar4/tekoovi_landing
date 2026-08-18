<?php

namespace App\Console\Commands;

use App\Models\Content;
use App\Repositories\ContentRepository;
use Illuminate\Console\Command;

/**
 * Cleans the junk keys an earlier `array` cast wrote into the content document.
 *
 * The Content model used to carry `protected $casts = ['data' => 'array']`.
 * That cast JSON-encodes on write, and the encoded string reached MongoDB as
 * one key per character — "0" => "{", "1" => "\"", and so on for tens of
 * thousands of keys — sitting alongside the real sections. Reads still worked
 * (section names always won), so the only symptom was a document tens of times
 * larger than it should be, and a slower round trip on every page.
 *
 * The cast is gone. This removes what it left behind. Section names are never
 * numeric, so filtering numeric top-level keys cannot touch real content, and
 * the command is safe to run more than once.
 */
class RepairContent extends Command
{
    protected $signature = 'content:repair {--dry-run : Report what would change without writing}';

    protected $description = 'Strip the junk numeric keys left in the content document by the old array cast';

    public function handle(): int
    {
        $document = Content::query()->where('key', Content::LANDING)->first();

        if (! $document) {
            $this->warn('No content document found — nothing to repair.');

            return self::SUCCESS;
        }

        $stored = (array) $document->getAttribute('data');
        $clean = ContentRepository::sanitizeStored($stored);
        $removed = count($stored) - count($clean);

        if ($removed === 0) {
            $this->info('Content document is already clean ('.count($clean).' sections).');

            return self::SUCCESS;
        }

        $this->line(sprintf(
            'Found %s junk keys beside %s real sections: %s',
            number_format($removed),
            count($clean),
            implode(', ', array_keys($clean)),
        ));

        if ($this->option('dry-run')) {
            $this->comment('Dry run — nothing written.');

            return self::SUCCESS;
        }

        $document->setAttribute('data', $clean);
        $document->save();

        $this->info(sprintf('Removed %s junk keys. All %s sections kept.', number_format($removed), count($clean)));

        return self::SUCCESS;
    }
}
