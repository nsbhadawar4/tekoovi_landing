<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\ContentRepository;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\Binary;

/**
 * Media storage — the port of `backend/repository/media.repository.ts` and
 * `backend/controllers/media.controller.ts`.
 *
 * Images live in the `media` collection as their own documents, exactly as
 * before, and are served back through /api/media/{id}.
 */
class MediaService
{
    public function __construct(
        private readonly ContentRepository $content,
        private readonly MediaUrlService $urls,
    ) {}

    /**
     * Split a `data:<type>;base64,<payload>` string into a mime type and bytes.
     *
     * @return array{contentType: string, bytes: string}|null
     */
    public function parseDataUrl(string $dataUrl): ?array
    {
        if (! preg_match('#^data:([^;]+);base64,(.+)$#s', $dataUrl, $matches)) {
            return null;
        }

        $contentType = strtolower(trim($matches[1]));
        if (! in_array($contentType, config('media.allowed_types'), true)) {
            return null;
        }

        $bytes = base64_decode($matches[2], true);
        if ($bytes === false || $bytes === '') {
            return null;
        }

        return ['contentType' => $contentType, 'bytes' => $bytes];
    }

    /**
     * Store an image and return its public URL.
     *
     * @throws \RuntimeException when the payload isn't a supported image
     */
    public function store(string $dataUrl): string
    {
        $parsed = $this->parseDataUrl($dataUrl);

        if (! $parsed) {
            throw new \RuntimeException('Invalid image data.');
        }

        if (strlen($parsed['bytes']) > config('media.max_bytes')) {
            throw new \RuntimeException('Image is too large.');
        }

        // Subtype 0 (generic binary) is what Mongoose's Buffer wrote, so old
        // and new documents are byte-for-byte the same shape.
        $media = Media::create([
            'contentType' => $parsed['contentType'],
            'data' => new Binary($parsed['bytes'], Binary::TYPE_GENERIC),
        ]);

        return $this->urls->urlFor((string) $media->getKey());
    }

    /**
     * Bytes for one image.
     *
     * @return array{contentType: string, bytes: string}|null
     */
    public function fetch(string $id): ?array
    {
        if (! $this->isValidId($id)) {
            return null;
        }

        $media = Media::query()->find($id);
        if (! $media || ! $media->data) {
            return null;
        }

        return [
            'contentType' => (string) $media->contentType,
            'bytes' => $this->toBytes($media->data),
        ];
    }

    /** Metadata for every stored image, newest first. */
    public function list(): array
    {
        return Media::query()
            ->orderByDesc('createdAt')
            ->get()
            ->map(fn (Media $media) => [
                'id' => (string) $media->getKey(),
                'url' => $this->urls->urlFor((string) $media->getKey()),
                'contentType' => (string) $media->contentType,
                'size' => strlen($this->toBytes($media->data)),
                'createdAt' => $media->createdAt,
            ])
            ->all();
    }

    public function delete(string $id): bool
    {
        if (! $this->isValidId($id)) {
            return false;
        }

        return Media::query()->where('_id', $id)->delete() > 0;
    }

    /**
     * One-time optimisation: walk the whole content tree and move any inline
     * `data:image/...` blob into the media store, replacing it with its URL.
     *
     * Idempotent — URLs are left untouched, so it's safe to run again.
     */
    public function migrateInlineImages(): int
    {
        $replaced = 0;

        $walk = function (mixed $value) use (&$walk, &$replaced): mixed {
            if (is_string($value)) {
                if (! str_starts_with($value, 'data:image/')) {
                    return $value;
                }

                try {
                    $url = $this->store($value);
                    $replaced++;

                    // Store the relative form, matching every other media path.
                    return $this->urls->toRelative($url);
                } catch (\Throwable $e) {
                    Log::warning('[media] inline image skipped', ['error' => $e->getMessage()]);

                    return $value;
                }
            }

            if (is_array($value)) {
                return array_map($walk, $value);
            }

            return $value;
        };

        $migrated = $walk($this->content->all());

        if ($replaced > 0) {
            $this->content->saveAll($migrated);
        }

        return $replaced;
    }

    /* ---------------------------- plumbing ---------------------------- */

    /** MongoDB ObjectIds are 24 hex characters — reject anything else early. */
    public function isValidId(string $id): bool
    {
        return (bool) preg_match('/^[a-f\d]{24}$/i', $id);
    }

    /**
     * Normalise whatever the driver hands back — BSON Binary, Buffer-ish object
     * or plain string — into raw bytes.
     */
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
}
