<?php

namespace App\Services;

use App\Models\Media;
use App\Repositories\ContentRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Media storage.
 *
 * Bytes go to the filesystem — `media/<id>.<ext>` on the configured disk, which
 * is `public` by default — and MySQL keeps the metadata: id, mime type, path and
 * size. That is the split cheap shared hosting wants: the database stays small
 * and the images are ordinary files that can be backed up, moved to a CDN or
 * served straight off disk.
 *
 * What did not change is the public contract. Every image is still addressed as
 * /api/media/{id}, because that exact path is what content records store, and
 * ids are still 24 hex characters, so paths written before this migration keep
 * resolving to the same bytes.
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
     * @throws \RuntimeException when the payload isn't a supported image, or the
     *                           file can't be written
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

        return $this->put($this->newId(), $parsed['contentType'], $parsed['bytes']);
    }

    /**
     * Write one image to disk and record it. Shared with the one-time MongoDB
     * import, which supplies the id it has to keep.
     *
     * @throws \RuntimeException when the disk write fails
     */
    public function put(string $id, string $contentType, string $bytes): string
    {
        $disk = $this->disk();
        $path = trim((string) config('media.directory', 'media'), '/').'/'.$id.'.'.$this->extensionFor($contentType);

        if (! Storage::disk($disk)->put($path, $bytes)) {
            throw new \RuntimeException('Could not write the image to storage.');
        }

        Media::query()->updateOrCreate(
            ['id' => $id],
            [
                'contentType' => $contentType,
                'path' => $path,
                'size' => strlen($bytes),
                'disk' => $disk,
            ],
        );

        return $this->urls->urlFor($id);
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
        if (! $media) {
            return null;
        }

        $bytes = $this->read($media);

        if ($bytes === null) {
            // The row outlived its file — a half-finished restore, say. Log it
            // and answer 404 rather than serving an empty image.
            Log::warning('[media] file missing for stored record', [
                'id' => $id,
                'disk' => $media->disk,
                'path' => $media->path,
            ]);

            return null;
        }

        return [
            'contentType' => (string) $media->contentType,
            'bytes' => $bytes,
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
                'size' => (int) $media->size,
                'createdAt' => $media->createdAt,
            ])
            ->all();
    }

    public function delete(string $id): bool
    {
        if (! $this->isValidId($id)) {
            return false;
        }

        $media = Media::query()->find($id);
        if (! $media) {
            return false;
        }

        // The row goes first: a deleted record with a stray file is harmless,
        // a live record pointing at nothing serves broken images.
        $media->delete();

        if ($media->path) {
            Storage::disk((string) ($media->disk ?: $this->disk()))->delete((string) $media->path);
        }

        return true;
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

    /**
     * Ids are 24 hex characters — the format the ids already in the content
     * carry, so one check covers records from before and after this migration.
     */
    public function isValidId(string $id): bool
    {
        return (bool) preg_match('/^[a-f\d]{24}$/i', $id);
    }

    /** A fresh id in the same 24-hex format as the existing ones. */
    public function newId(): string
    {
        return bin2hex(random_bytes(12));
    }

    /** Where image files live. */
    public function disk(): string
    {
        return (string) config('media.disk', 'public');
    }

    /** Read one record's bytes, or null when the file has gone. */
    private function read(Media $media): ?string
    {
        $disk = Storage::disk((string) ($media->disk ?: $this->disk()));
        $path = (string) $media->path;

        if ($path === '' || ! $disk->exists($path)) {
            return null;
        }

        $bytes = $disk->get($path);

        return is_string($bytes) && $bytes !== '' ? $bytes : null;
    }

    /** File extension for a mime type; the type list is in config/media.php. */
    private function extensionFor(string $contentType): string
    {
        return match ($contentType) {
            'image/jpeg' => 'jpg',
            'image/svg+xml' => 'svg',
            default => explode('/', $contentType)[1] ?? 'bin',
        };
    }
}
