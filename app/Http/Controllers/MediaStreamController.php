<?php

namespace App\Http\Controllers;

use App\Services\MediaService;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the bytes behind /api/media/{id}.
 *
 * The path is deliberately unchanged: content documents store "/api/media/<id>"
 * for every uploaded image, and rewriting thousands of stored paths to gain a
 * prettier URL would be a migration with no upside. Public and cached hard —
 * a new upload gets a new id, so the bytes behind one URL never change.
 */
class MediaStreamController extends Controller
{
    public function __construct(private readonly MediaService $media) {}

    public function __invoke(string $id): Response
    {
        $media = $this->media->fetch($id);

        if (! $media) {
            return response('Not found', 404);
        }

        return response($media['bytes'], 200, [
            'Content-Type' => $media['contentType'],
            'Content-Length' => (string) strlen($media['bytes']),
            'Cache-Control' => config('media.cache_control'),
        ]);
    }
}
