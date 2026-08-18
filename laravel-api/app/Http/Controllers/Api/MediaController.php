<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class MediaController extends Controller
{
    public function __construct(private readonly MediaService $media) {}

    /**
     * POST /api/media — { dataUrl } -> { url } (admin only).
     *
     * The admin crops in the browser and posts a data URL; the same contract
     * the Node route had, so the upload component is untouched.
     */
    public function store(Request $request): JsonResponse
    {
        $dataUrl = $request->input('dataUrl');

        if (! is_string($dataUrl) || $dataUrl === '') {
            return response()->json(['error' => 'No image data.'], 400);
        }

        try {
            return response()->json(['url' => $this->media->store($dataUrl)], 201);
        } catch (\RuntimeException $e) {
            // A bad payload is the caller's problem, not a server fault.
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            Log::error('[api/media] upload failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Upload failed'], 500);
        }
    }

    /**
     * GET /api/media/{id} — the image bytes.
     *
     * Public and cached hard: a new upload gets a new id, so the bytes behind
     * one URL never change.
     */
    public function show(string $id): Response
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

    /** GET /api/media — metadata for everything stored (admin only). */
    public function index(): JsonResponse
    {
        return response()->json(['items' => $this->media->list()]);
    }

    /** DELETE /api/media/{id} — remove one image (admin only). */
    public function destroy(string $id): JsonResponse
    {
        if (! $this->media->isValidId($id)) {
            return response()->json(['error' => 'Invalid media id.'], 400);
        }

        if (! $this->media->delete($id)) {
            return response()->json(['error' => 'Not found.'], 404);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/media/migrate — move inline base64 images into the media store
     * (admin only). Idempotent, and safe to run on a live site.
     */
    public function migrate(): JsonResponse
    {
        try {
            return response()->json(['replaced' => $this->media->migrateInlineImages()]);
        } catch (\Throwable $e) {
            Log::error('[api/media/migrate] failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Migration failed'], 500);
        }
    }
}
