<?php

namespace App\Services;

use App\Repositories\ContentRepository;
use App\Support\Sections;

/**
 * Content business logic — the port of `backend/controllers/content.controller.ts`.
 *
 * Three jobs:
 *   1. coerce incoming values to the type their field declares
 *   2. keep unknown fields out of storage
 *   3. blank out switched-off fields on the way to the public site
 */
class ContentService
{
    public function __construct(
        private readonly ContentRepository $repository,
        private readonly MediaUrlService $mediaUrls,
    ) {}

    /* ----------------------------- reads ------------------------------ */

    /**
     * The whole document for the public site: visibility applied and media
     * paths made absolute so the frontend can render them from any origin.
     */
    public function publicContent(): array
    {
        return $this->mediaUrls->toAbsolute(
            $this->applyVisibility($this->repository->all())
        );
    }

    /** One collection, exactly as stored (the admin edits raw values). */
    public function listSection(string $section): array
    {
        return $this->mediaUrls->toAbsolute($this->repository->section($section));
    }

    /** One singleton block, exactly as stored. */
    public function getSingleton(string $section): array
    {
        return $this->mediaUrls->toAbsolute($this->repository->singleton($section));
    }

    /* ----------------------------- writes ----------------------------- */

    /**
     * @return array{ok: true, item: array}|array{ok: false, error: string, status: int}
     */
    public function createItem(string $section, array $body): array
    {
        if (Sections::isSingleton($section)) {
            return ['ok' => false, 'error' => "This section can't add items.", 'status' => 400];
        }

        $fields = $this->sanitize($section, $body);

        if (! $this->hasContent($this->contentValues($fields))) {
            return ['ok' => false, 'error' => 'Please fill at least one field.', 'status' => 400];
        }

        return ['ok' => true, 'item' => $this->repository->addItem($section, $fields)];
    }

    /**
     * @return array{ok: true, item: array}|array{ok: false, error: string, status: int}
     */
    public function editItem(string $section, string $id, array $body): array
    {
        $item = $this->repository->updateItem($section, $id, $this->sanitize($section, $body));

        return $item
            ? ['ok' => true, 'item' => $item]
            : ['ok' => false, 'error' => 'Item not found.', 'status' => 404];
    }

    public function deleteItem(string $section, string $id): bool
    {
        if (Sections::isSingleton($section)) {
            return false;
        }

        return $this->repository->removeItem($section, $id);
    }

    /**
     * @return array{ok: true, item: array}|array{ok: false, error: string, status: int}
     */
    public function editSingleton(string $section, array $body): array
    {
        if (! Sections::isSingleton($section)) {
            return ['ok' => false, 'error' => "This section isn't editable in place.", 'status' => 400];
        }

        $fields = $this->sanitize($section, $body);

        return ['ok' => true, 'item' => $this->repository->updateSingleton($section, $fields)];
    }

    /* --------------------------- sanitising --------------------------- */

    /**
     * Keep only fields this section declares, coerced to their type.
     *
     * Media URLs are folded back to their stored relative form, so the document
     * keeps the exact shape it has today regardless of which host served it.
     */
    public function sanitize(string $section, array $body): array
    {
        $out = [];

        foreach (Sections::fields($section) as $name => $type) {
            if (! array_key_exists($name, $body)) {
                continue;
            }
            $out[$name] = $this->coerce($type, $body[$name]);
        }

        $hiddenKey = Sections::hiddenKey();
        $definition = Sections::definition($section);

        if (array_key_exists($hiddenKey, $body) && ! ($definition['noToggles'] ?? false)) {
            $out[$hiddenKey] = $this->coerceHidden($section, $body[$hiddenKey]);
        }

        return $this->mediaUrls->toRelative($out);
    }

    /** One incoming value, in the shape its field declares. */
    private function coerce(string $type, mixed $value): mixed
    {
        return match ($type) {
            'tags' => $this->coerceTags($value),
            'boolean' => $value === true || $value === 'true' || $value === 'on' || $value === 1 || $value === '1',
            'number' => is_numeric($value) ? $value + 0 : 0,
            default => trim((string) ($value ?? '')),
        };
    }

    /** @return list<string> */
    private function coerceTags(mixed $value): array
    {
        $parts = is_array($value) ? $value : explode(',', (string) ($value ?? ''));

        return array_values(array_filter(
            array_map(fn ($part) => trim((string) $part), $parts),
            fn (string $part) => $part !== '',
        ));
    }

    /**
     * Normalise the hidden-field list.
     *
     * The admin sends a comma-joined string (its form state is flat); an array
     * is accepted too. Unknown names and fields that have no switch are dropped,
     * so a crafted request can't hide something the admin UI can't restore.
     *
     * @return list<string>
     */
    private function coerceHidden(string $section, mixed $value): array
    {
        $names = is_array($value) ? $value : explode(',', (string) ($value ?? ''));
        $allowed = Sections::toggleableFields($section);

        return array_values(array_filter(
            array_map(fn ($name) => trim((string) $name), $names),
            fn (string $name) => in_array($name, $allowed, true),
        ));
    }

    /** The editable values only — visibility flags aren't content. */
    private function contentValues(array $fields): array
    {
        unset($fields[Sections::hiddenKey()]);

        return $fields;
    }

    /** At least one meaningful value must be present when creating. */
    private function hasContent(array $fields): bool
    {
        foreach ($fields as $value) {
            $meaningful = match (true) {
                is_array($value) => count($value) > 0,
                is_bool($value) => false,
                is_int($value) || is_float($value) => true,
                default => (string) $value !== '',
            };

            if ($meaningful) {
                return true;
            }
        }

        return false;
    }

    /* ---------------------------- visibility -------------------------- */

    /**
     * Blank every field the admin switched off, across the whole document.
     *
     * `hiddenFields` itself stays on the record — a few components need to tell
     * "hidden" from "empty", because their blank value has a fallback of its own.
     */
    public function applyVisibility(array $data): array
    {
        foreach (Sections::keys() as $section) {
            if (! array_key_exists($section, $data) || ! is_array($data[$section])) {
                continue;
            }

            $data[$section] = Sections::isCollection($section)
                ? array_map(fn ($item) => is_array($item) ? $this->hideFields($section, $item) : $item, $data[$section])
                : $this->hideFields($section, $data[$section]);
        }

        return $data;
    }

    /** One record with its switched-off fields blanked. */
    private function hideFields(string $section, array $record): array
    {
        $hidden = $record[Sections::hiddenKey()] ?? [];
        if (! is_array($hidden) || $hidden === []) {
            return $record;
        }

        foreach (Sections::fields($section) as $name => $type) {
            if (! in_array($name, $hidden, true) || ! array_key_exists($name, $record)) {
                continue;
            }
            $record[$name] = $this->blankFor($type, $record[$name]);
        }

        return $record;
    }

    /**
     * The stand-in for a hidden field.
     *
     * Blank values are what every section already renders nothing for. Numbers
     * keep their value — 0 is a real stat, so the components that render one
     * check the hidden list directly instead.
     */
    private function blankFor(string $type, mixed $value): mixed
    {
        return match ($type) {
            'tags' => [],
            'boolean' => false,
            'number' => $value,
            default => '',
        };
    }
}
