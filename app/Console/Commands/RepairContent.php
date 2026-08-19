<?php

namespace App\Console\Commands;

use App\Models\Content;
use App\Repositories\ContentRepository;
use Illuminate\Console\Command;

/**
 * Writes the content record back in the shape the app expects.
 *
 * Two legacy artefacts are cleaned, both by ContentRepository::sanitizeStored():
 *
 *   junk keys  a cast that JSON-encoded into a store which was already encoding
 *              turned the section tree into one key per character — "0" => "{",
 *              "1" => "\"", and so on for tens of thousands of keys — sitting
 *              alongside the real sections. Reads still worked (section names
 *              always won), so the only symptom was a record tens of times larger
 *              than it should be, and a slower round trip on every page.
 *   item ids   records from the original Mongoose backend carry their id under
 *              `_id`, which is the one key the admin needs to address an item by.
 *
 * Reads already apply both fixes, so the site is correct either way; this makes
 * the stored record correct too. Safe to run more than once, and safe on a live
 * site — no value is changed, only the key it sits under.
 */
class RepairContent extends Command
{
    protected $signature = 'content:repair {--dry-run : Report what would change without writing}';

    protected $description = 'Rewrite the content record without its legacy junk keys and `_id` item keys';

    public function handle(): int
    {
        $document = Content::query()->where('key', Content::LANDING)->first();

        if (! $document) {
            $this->warn('No content record found — nothing to repair.');

            return self::SUCCESS;
        }

        $stored = (array) $document->getAttribute('data');
        $clean = ContentRepository::sanitizeStored($stored);

        if ($stored === $clean) {
            $this->info('Content record is already clean ('.count($clean).' sections).');

            return self::SUCCESS;
        }

        $junk = count($stored) - count($clean);
        $renamed = $this->countLegacyIds($stored);

        if ($junk > 0) {
            $this->line(sprintf(
                'Found %s junk keys beside %s real sections: %s',
                number_format($junk),
                count($clean),
                implode(', ', array_keys($clean)),
            ));
        }

        if ($renamed > 0) {
            $this->line(sprintf('Found %s items carrying a legacy `_id` to rename to `id`.', number_format($renamed)));
        }

        if ($this->option('dry-run')) {
            $this->comment('Dry run — nothing written.');

            return self::SUCCESS;
        }

        $document->setAttribute('data', $clean);
        $document->save();

        $this->info(sprintf(
            'Repaired: %s junk keys removed, %s item ids renamed. All %s sections kept.',
            number_format($junk),
            number_format($renamed),
            count($clean),
        ));

        return self::SUCCESS;
    }

    /** How many collection items still carry their id under `_id`. */
    private function countLegacyIds(array $data): int
    {
        $count = 0;

        foreach ($data as $value) {
            if (! is_array($value) || ! array_is_list($value)) {
                continue;
            }

            foreach ($value as $item) {
                if (is_array($item) && array_key_exists('_id', $item)) {
                    $count++;
                }
            }
        }

        return $count;
    }
}
