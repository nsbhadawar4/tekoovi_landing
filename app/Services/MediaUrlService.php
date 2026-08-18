<?php

namespace App\Services;

/**
 * Media URLs, translated at the edges.
 *
 * Content documents store image paths relative — "/api/media/<id>" — and that
 * is exactly what the browser needs now that one Laravel app serves both the
 * pages and the bytes. So the default read path leaves them alone: a relative
 * path resolves against whatever host the site is on, which is what makes the
 * same database work on localhost, a staging domain and production without a
 * migration.
 *
 * Two translations remain:
 *
 *   reads   only when MEDIA_BASE_URL is set (a CDN or separate image host in
 *           front of the app) do stored paths get an absolute prefix
 *   writes  always fold an absolute media URL — from any host — back to its
 *           relative form, so legacy documents and pasted URLs normalise and
 *           the stored shape stays portable
 *
 * Both directions walk arbitrary nested data, because image paths appear inside
 * lists, blocks and nested fields all over the content tree.
 */
class MediaUrlService
{
    /** Where media is served from, e.g. https://cdn.example.com. Empty = this app. */
    public function baseUrl(): string
    {
        return rtrim((string) config('media.base_url', ''), '/');
    }

    /** The public URL for one image. Relative unless a media host is configured. */
    public function urlFor(string $id): string
    {
        return $this->baseUrl().'/api/media/'.$id;
    }

    /**
     * Make stored paths renderable.
     *
     * With no media host configured this is a pass-through, which keeps the
     * markup host-independent. With one, every "/api/media/..." path is
     * prefixed so the images come off the CDN.
     */
    public function toAbsolute(mixed $value): mixed
    {
        $base = $this->baseUrl();

        if ($base === '') {
            return $value;
        }

        return $this->walk(
            $value,
            fn (string $text) => str_starts_with($text, '/api/media/') ? $base.$text : $text,
        );
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
