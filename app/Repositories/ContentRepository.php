<?php

namespace App\Repositories;

use App\Models\Content;
use Illuminate\Support\Facades\Log;

/**
 * Storage layer for the content record.
 *
 * One row keyed "landing" in the `content` table, its whole section tree held in
 * a JSON column, seeded once from the bundled JSON, with sections read and
 * written as plain arrays. Behaviour is unchanged from the MongoDB version this
 * replaced — the model does the JSON encoding, so callers still see arrays.
 */
class ContentRepository
{
    /**
     * Memo so the several callers in one request share a single round trip.
     *
     * It is stamped with the generation below rather than simply held, because
     * a repository instance can outlive the request that made it: Laravel
     * memoises a controller on its Route object, and Route objects live as long
     * as the application does. Under `php artisan test` — and under any
     * long-lived runtime such as Octane — that made a controller keep serving
     * the content it read on the first request, even after an admin write.
     */
    private ?array $cache = null;

    private int $cachedAt = -1;

    /** Bumped by every write, which invalidates every memo in the process. */
    private static int $generation = 0;

    /* ----------------------------- reads ------------------------------ */

    /** The whole content document, with any sections it predates filled in. */
    public function all(): array
    {
        if ($this->cache !== null && $this->cachedAt === self::$generation) {
            return $this->cache;
        }

        try {
            $document = Content::query()->where('key', Content::LANDING)->first();

            // A read never writes. An empty database serves the bundled content
            // and stays empty until someone runs `php artisan content:seed` —
            // so a misconfigured connection can't quietly plant a second
            // document beside the real one.
            if (! $document) {
                return $this->remember($this->seed());
            }

            return $this->remember($this->withSeedDefaults(
                self::sanitizeStored((array) $document->getAttribute('data')),
            ));
        } catch (\Throwable $e) {
            // Never let a database hiccup take the public site down — serve the
            // bundled content and log loudly, as the Node backend did.
            Log::error('[content] database read failed, serving seed content', ['error' => $e->getMessage()]);

            return $this->remember($this->seed());
        }
    }

    public function section(string $section): array
    {
        $value = $this->all()[$section] ?? [];

        return is_array($value) ? array_values($value) : [];
    }

    public function singleton(string $section): array
    {
        $value = $this->all()[$section] ?? [];

        return is_array($value) ? $value : [];
    }

    /* ----------------------------- writes ----------------------------- */

    public function saveAll(array $data): void
    {
        $clean = self::sanitizeStored($data);

        Content::query()->updateOrCreate(
            ['key' => Content::LANDING],
            ['data' => $clean],
        );

        self::$generation++;
        $this->remember($clean);
    }

    /** Append an item to a collection; the id is generated here. */
    public function addItem(string $section, array $fields): array
    {
        $data = $this->all();
        // The generated id goes on last, so a posted `id` can never override it.
        $item = array_merge($fields, ['id' => $this->generateId()]);

        $list = is_array($data[$section] ?? null) ? array_values($data[$section]) : [];
        $list[] = $item;
        $data[$section] = $list;

        $this->saveAll($data);

        return $item;
    }

    /** Patch an item by id. Null when the section or id is unknown. */
    public function updateItem(string $section, string $id, array $fields): ?array
    {
        $data = $this->all();
        $list = is_array($data[$section] ?? null) ? array_values($data[$section]) : null;
        if ($list === null) {
            return null;
        }

        foreach ($list as $index => $item) {
            if (($item['id'] ?? null) !== $id) {
                continue;
            }

            $updated = array_merge($item, $fields, ['id' => $id]);
            $list[$index] = $updated;
            $data[$section] = $list;
            $this->saveAll($data);

            return $updated;
        }

        return null;
    }

    public function removeItem(string $section, string $id): bool
    {
        $data = $this->all();
        $list = is_array($data[$section] ?? null) ? array_values($data[$section]) : null;
        if ($list === null) {
            return false;
        }

        $remaining = array_values(array_filter(
            $list,
            fn (array $item) => ($item['id'] ?? null) !== $id,
        ));

        if (count($remaining) === count($list)) {
            return false;
        }

        $data[$section] = $remaining;
        $this->saveAll($data);

        return true;
    }

    /** Merge values into a singleton block. */
    public function updateSingleton(string $section, array $fields): array
    {
        $data = $this->all();
        $current = is_array($data[$section] ?? null) ? $data[$section] : [];
        $merged = array_merge($current, $fields);

        $data[$section] = $merged;
        $this->saveAll($data);

        return $merged;
    }

    /* ---------------------------- plumbing ---------------------------- */

    /** Hold a read against the current generation. */
    private function remember(array $data): array
    {
        $this->cachedAt = self::$generation;

        return $this->cache = $data;
    }

    /**
     * Drop the numeric keys an earlier double-encoding bug wrote into the data.
     *
     * Some stored trees carry one key per character ("0" => "{", "1" => "\"", …)
     * beside the real sections, left by a cast that JSON-encoded into a store
     * that was already encoding. Section names are never numeric, so filtering
     * numeric top-level keys removes the junk and can't touch real content.
     * Applied on both read and write, and on import, so a record repairs itself
     * the first time the admin saves anything.
     */
    public static function sanitizeStored(array $data): array
    {
        return self::normalizeItemIds(array_filter(
            $data,
            fn ($key) => ! ctype_digit((string) $key),
            ARRAY_FILTER_USE_KEY,
        ));
    }

    /**
     * Give every collection item an `id`, renaming a legacy `_id` onto it.
     *
     * Items written by this app carry `id` — that is what the bundled seed uses,
     * what addItem() generates, and what the admin views and updateItem()/
     * removeItem() address records by. Records that came from the original
     * Mongoose backend carry the same values under `_id` instead, the naming that
     * store imposed, which left the admin unable to see an id at all.
     *
     * The rename is value-preserving ("pc1" stays "pc1"), so item URLs and any
     * link that already resolves by id keep working; slugs come from a record's
     * name or title, and only fall back to the id, so they don't move either. An
     * existing `id` always wins, and applying this on read as well as on write
     * means a record repairs itself the next time the admin saves.
     */
    private static function normalizeItemIds(array $data): array
    {
        foreach ($data as $section => $value) {
            // Collections only: singleton blocks are keyed by field name.
            if (! is_array($value) || ! array_is_list($value)) {
                continue;
            }

            foreach ($value as $index => $item) {
                if (! is_array($item) || ! array_key_exists('_id', $item)) {
                    continue;
                }

                if (! array_key_exists('id', $item) || (string) $item['id'] === '') {
                    $item['id'] = (string) $item['_id'];
                }

                unset($item['_id']);
                $data[$section][$index] = $item;
            }
        }

        return $data;
    }

    /**
     * Item ids match the Node format ("x" + random + time, base 36) because
     * existing documents already use them and the admin addresses items by id.
     */
    private function generateId(): string
    {
        $random = substr(base_convert(bin2hex(random_bytes(8)), 16, 36), 0, 7);
        $time = substr(base_convert((string) (int) (microtime(true) * 1000), 10, 36), -4);

        return 'x'.$random.$time;
    }

    /** The bundled starting content. */
    private function seed(): array
    {
        static $seed = null;

        if ($seed === null) {
            $path = resource_path('data/content.json');
            $seed = is_file($path)
                ? (json_decode(file_get_contents($path), true) ?: [])
                : [];
        }

        return $seed;
    }

    /**
     * Backfill sections the stored document predates.
     *
     * A present key always wins — including an empty array, which is a real
     * "admin deleted everything" state and must not be resurrected.
     */
    private function withSeedDefaults(array $stored): array
    {
        return array_merge($this->seed(), $stored);
    }
}
