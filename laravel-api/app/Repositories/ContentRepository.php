<?php

namespace App\Repositories;

use App\Models\Content;
use Illuminate\Support\Facades\Log;

/**
 * Storage layer for the content document.
 *
 * Port of the Node `backend/repository/content.repository.ts`, preserving its
 * behaviour exactly: one document keyed "landing", seeded once from the bundled
 * JSON, with sections read and written as plain arrays.
 */
class ContentRepository
{
    /** In-request memo — several callers share one round trip. */
    private ?array $cache = null;

    /* ----------------------------- reads ------------------------------ */

    /** The whole content document, with any sections it predates filled in. */
    public function all(): array
    {
        if ($this->cache !== null) {
            return $this->cache;
        }

        try {
            $document = Content::query()->where('key', Content::LANDING)->first();

            // A read never writes. An empty database serves the bundled content
            // and stays empty until someone runs `php artisan content:seed` —
            // so a misconfigured connection can't quietly plant a second
            // document beside the real one.
            if (! $document) {
                return $this->cache = $this->seed();
            }

            return $this->cache = $this->withSeedDefaults((array) $document->data);
        } catch (\Throwable $e) {
            // Never let a database hiccup take the public site down — serve the
            // bundled content and log loudly, as the Node backend did.
            Log::error('[content] Mongo read failed, serving seed content', ['error' => $e->getMessage()]);

            return $this->cache = $this->seed();
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
        Content::query()->updateOrCreate(
            ['key' => Content::LANDING],
            ['data' => $data],
        );

        $this->cache = $data;
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
