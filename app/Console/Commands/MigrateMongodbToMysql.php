<?php

namespace App\Console\Commands;

use App\Models\Content;
use App\Models\Media;
use App\Models\User;
use App\Repositories\ContentRepository;
use App\Services\MediaService;
use Illuminate\Console\Command;
use MongoDB\BSON\Binary;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Driver\Manager;
use MongoDB\Driver\Query;

/**
 * One-time import of the old MongoDB data into MySQL.
 *
 * Reads the three collections the app used and writes them into the relational
 * schema, keeping every key that the data itself depends on:
 *
 *   content  one document per page key -> one row, its nested `data` tree
 *            landing in the JSON column unchanged
 *   media    one document per image -> one row plus the bytes written to
 *            storage/app/public/media, keeping the original 24-hex ObjectId as
 *            the row's id, because content records address images as
 *            "/api/media/<id>" and those paths have to keep resolving
 *   users    copied across as-is (the admin sign-in reads the environment, so
 *            this collection is usually empty)
 *
 * Safe to run more than once: nothing is imported twice, existing rows are left
 * alone unless --force is passed, and nothing in MongoDB is modified or deleted.
 *
 * It talks to the `mongodb` PHP extension directly rather than through a Laravel
 * package, so it keeps working after mongodb/laravel-mongodb has been removed
 * from composer.json — the extension is the only requirement, and only while
 * this command is being run.
 */
class MigrateMongodbToMysql extends Command
{
    protected $signature = 'app:migrate-mongodb-to-mysql
        {--uri= : MongoDB connection string (defaults to MONGODB_URI)}
        {--database= : Source database name (defaults to MONGODB_DATABASE)}
        {--force : Overwrite rows that already exist in MySQL}
        {--dry-run : Report what would be imported without writing anything}';

    protected $description = 'Import the existing MongoDB content, media and users into MySQL (one-time)';

    public function __construct(private readonly MediaService $media)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        if (! extension_loaded('mongodb')) {
            $this->error('The `mongodb` PHP extension is not loaded — it is needed to read the old database.');

            return self::FAILURE;
        }

        $uri = (string) ($this->option('uri') ?: env('MONGODB_URI', ''));
        $database = (string) ($this->option('database') ?: env('MONGODB_DATABASE', 'tekoovi'));

        if ($uri === '') {
            $this->error('No MongoDB connection string. Pass --uri=... or set MONGODB_URI in .env.');

            return self::FAILURE;
        }

        if ($database === '') {
            $this->error('No source database. Pass --database=... or set MONGODB_DATABASE in .env.');

            return self::FAILURE;
        }

        $this->dryRun = (bool) $this->option('dry-run');
        $this->force = (bool) $this->option('force');

        try {
            // Fail fast rather than hanging: a wrong URI should say so.
            $manager = new Manager($uri, ['serverSelectionTimeoutMS' => (int) env('MONGODB_TIMEOUT_MS', 8000)]);
        } catch (\Throwable $e) {
            $this->error('Could not open the MongoDB connection: '.$e->getMessage());

            return self::FAILURE;
        }

        $this->line('Source: MongoDB database "'.$database.'"');
        $this->line('Target: MySQL "'.config('database.connections.'.config('database.default').'.database').'"');

        if ($this->dryRun) {
            $this->comment('Dry run — nothing will be written.');
        }

        $this->newLine();

        try {
            $content = $this->importContent($manager, $database);
            $media = $this->importMedia($manager, $database);
            $users = $this->importUsers($manager, $database);
        } catch (\Throwable $e) {
            $this->newLine();
            $this->error('Import failed: '.$e->getMessage());
            $this->warn('Nothing in MongoDB was changed. Fix the cause and run the command again.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info(sprintf(
            'Done. content: %d imported, %d skipped · media: %d imported, %d skipped · users: %d imported, %d skipped',
            $content['imported'], $content['skipped'],
            $media['imported'], $media['skipped'],
            $users['imported'], $users['skipped'],
        ));

        if ($this->failures !== []) {
            $this->newLine();
            $this->warn(count($this->failures).' record(s) could not be imported:');
            foreach ($this->failures as $failure) {
                $this->line('  - '.$failure);
            }

            return self::FAILURE;
        }

        if (! $this->dryRun) {
            $this->newLine();
            $this->comment('The MongoDB data is untouched. Verify the site, then you can retire the old database.');
        }

        return self::SUCCESS;
    }

    private bool $dryRun = false;

    private bool $force = false;

    /** @var list<string> */
    private array $failures = [];

    /* ---------------------------- collections --------------------------- */

    /**
     * The content documents: one row per key, `data` straight into the JSON
     * column. The stored tree is passed through the repository's sanitiser,
     * which strips the junk numeric keys an old `array` cast left in some
     * documents — those were never content and must not reach MySQL.
     *
     * @return array{imported: int, skipped: int}
     */
    private function importContent(Manager $manager, string $database): array
    {
        $imported = $skipped = 0;

        foreach ($this->documents($manager, $database, 'content') as $document) {
            $key = (string) ($document['key'] ?? '');

            if ($key === '') {
                $this->failures[] = 'content document without a `key` (id '.$this->idOf($document).')';

                continue;
            }

            $existing = Content::query()->where('key', $key)->first();

            if ($existing && ! $this->force) {
                $this->line('  content "'.$key.'" already in MySQL — skipped');
                $skipped++;

                continue;
            }

            $data = ContentRepository::sanitizeStored((array) ($document['data'] ?? []));

            $this->line(sprintf(
                '  content "%s": %d sections, %s of JSON%s',
                $key,
                count($data),
                $this->bytes(strlen((string) json_encode($data))),
                $existing ? ' (overwriting)' : '',
            ));

            if (! $this->dryRun) {
                $row = Content::query()->firstOrNew(['key' => $key]);
                $row->key = $key;
                $row->data = $data;
                $this->stampTimestamps($row, $document);
                $row->save();
            }

            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    /**
     * The media documents: bytes onto the disk, metadata into the row, id
     * preserved so every "/api/media/<id>" already stored in the content keeps
     * resolving to the same image.
     *
     * @return array{imported: int, skipped: int}
     */
    private function importMedia(Manager $manager, string $database): array
    {
        $imported = $skipped = 0;

        foreach ($this->documents($manager, $database, 'media') as $document) {
            $id = $this->idOf($document);

            if (! $this->media->isValidId($id)) {
                $this->failures[] = 'media id is not a 24-character ObjectId: "'.$id.'"';

                continue;
            }

            if (Media::query()->whereKey($id)->exists() && ! $this->force) {
                $skipped++;

                continue;
            }

            $contentType = strtolower(trim((string) ($document['contentType'] ?? '')));
            $bytes = $this->toBytes($document['data'] ?? null);

            if ($bytes === '') {
                $this->failures[] = 'media '.$id.' has no image bytes';

                continue;
            }

            if ($contentType === '') {
                $this->failures[] = 'media '.$id.' has no contentType';

                continue;
            }

            $this->line(sprintf('  media %s: %s, %s', $id, $contentType, $this->bytes(strlen($bytes))));

            if (! $this->dryRun) {
                try {
                    // Writes the file and the row together, exactly as a fresh
                    // upload does — same paths, same shape.
                    $this->media->put($id, $contentType, $bytes);
                    $this->stampTimestamps(Media::query()->findOrFail($id), $document)->save();
                } catch (\Throwable $e) {
                    $this->failures[] = 'media '.$id.': '.$e->getMessage();

                    continue;
                }
            }

            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    /**
     * The users collection. Passwords are copied as stored — they are already
     * bcrypt hashes — so existing credentials keep working.
     *
     * @return array{imported: int, skipped: int}
     */
    private function importUsers(Manager $manager, string $database): array
    {
        $imported = $skipped = 0;

        foreach ($this->documents($manager, $database, 'users') as $document) {
            $email = trim((string) ($document['email'] ?? ''));

            if ($email === '') {
                $this->failures[] = 'user document without an email (id '.$this->idOf($document).')';

                continue;
            }

            if (User::query()->where('email', $email)->exists() && ! $this->force) {
                $skipped++;

                continue;
            }

            $this->line('  user '.$email);

            if (! $this->dryRun) {
                $user = User::query()->firstOrNew(['email' => $email]);
                $user->name = (string) ($document['name'] ?? $email);
                $user->email = $email;
                // Already hashed in the source; setRawAttributes-style assignment
                // via the attribute bag skips the model's `hashed` cast.
                $user->setAttribute('password', (string) ($document['password'] ?? ''));
                $user->save();
            }

            $imported++;
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    /* ------------------------------ plumbing ---------------------------- */

    /**
     * Every document in one collection, as plain PHP arrays.
     *
     * @return iterable<array<string, mixed>>
     */
    private function documents(Manager $manager, string $database, string $collection): iterable
    {
        $this->line('Reading '.$database.'.'.$collection.' …');

        $cursor = $manager->executeQuery(
            $database.'.'.$collection,
            new Query([], ['sort' => ['createdAt' => 1]]),
        );

        // Arrays all the way down, except the BSON types that carry meaning:
        // ObjectId, UTCDateTime and Binary are left as objects and unwrapped
        // where they are used.
        $cursor->setTypeMap(['root' => 'array', 'document' => 'array', 'array' => 'array']);

        foreach ($cursor as $document) {
            yield (array) $document;
        }
    }

    /** The document's `_id` as a plain string. */
    private function idOf(array $document): string
    {
        $id = $document['_id'] ?? null;

        return $id instanceof ObjectId ? (string) $id : (string) $id;
    }

    /** Raw bytes out of whatever the driver handed back for a Binary field. */
    private function toBytes(mixed $raw): string
    {
        if ($raw instanceof Binary) {
            return $raw->getData();
        }

        if (is_string($raw)) {
            return $raw;
        }

        if (is_object($raw) && method_exists($raw, 'getData')) {
            return (string) $raw->getData();
        }

        return '';
    }

    /**
     * Carry the original createdAt/updatedAt across, so the media library keeps
     * its ordering and the rows keep their history.
     *
     * @template T of \Illuminate\Database\Eloquent\Model
     *
     * @param  T  $row
     * @return T
     */
    private function stampTimestamps($row, array $document)
    {
        foreach (['createdAt', 'updatedAt'] as $column) {
            $value = $document[$column] ?? null;

            if ($value instanceof UTCDateTime) {
                $row->setAttribute($column, $value->toDateTime());
            }
        }

        // Keep the imported timestamps rather than letting Eloquent overwrite
        // them with "now" on save.
        $row->timestamps = false;

        return $row;
    }

    private function bytes(int $size): string
    {
        return $size >= 1024 * 1024
            ? number_format($size / 1024 / 1024, 1).' MB'
            : number_format($size / 1024, 1).' KB';
    }
}
