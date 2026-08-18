<?php

namespace App\Services;

/**
 * Media URLs, translated at the edges.
 *
 * Content documents store image paths relative — "/api/media/<id>" — which was
 * fine when one Next.js server served both the API and the pages. Now the API
 * lives on its own origin, so:
 *
 *   reads   relative -> absolute, letting the frontend render an image from
 *           any host without touching a single component
 *   writes  absolute -> relative, so the stored document keeps the exact shape
 *           it has today and stays portable across domains
 *
 * Both directions walk arbitrary nested data, because image paths appear inside
 * lists, blocks and nested fields all over the content tree.
 */
class MediaUrlService
{
    /** Public base for media, e.g. https://api.example.com — no trailing slash. */
    public function baseUrl(): string
    {
        return rtrim((string) config('media.base_url', config('app.url')), '/');
    }

    public function urlFor(string $id): string
    {
        return $this->baseUrl().'/api/media/'.$id;
    }

    /** Rewrite every stored "/api/media/..." path to an absolute URL. */
    public function toAbsolute(mixed $value): mixed
    {
        $base = $this->baseUrl();

        return $this->walk($value, function (string $text) use ($base) {
            return str_starts_with($text, '/api/media/')
                ? $base.$text
                : $text;
        });
    }

    /** Fold an absolute media URL — from any host — back to its stored path. */
    public function toRelative(mixed $value): mixed
    {
        return $this->walk($value, function (string $text) {
            if (! preg_match('#^https?://[^/]+(/api/media/[A-Za-z0-9]+)$#', $text, $matches)) {
                return $text;
            }

            return $matches[1];
        });
    }

    /** Apply a string transform to every scalar in a nested structure. */
    private function walk(mixed $value, callable $transform): mixed
    {
        if (is_string($value)) {
            return $transform($value);
        }

        if (is_array($value)) {
            return array_map(fn ($item) => $this->walk($item, $transform), $value);
        }

        return $value;
    }
}
