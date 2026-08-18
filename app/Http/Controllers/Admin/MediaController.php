<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\MediaService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Media management inside the admin panel.
 *
 * Uploads stay XHR because the cropper produces the bytes in the browser: the
 * operator frames the image, the canvas exports a data URL, and it is posted
 * here without the surrounding content form losing its state. The library page
 * and delete are ordinary server-rendered flows.
 */
class MediaController extends Controller
{
    public function __construct(private readonly MediaService $media) {}

    /** GET /admin/media — the library. */
    public function index(): View
    {
        return view('admin.media', [
            'items' => $this->media->list(),
            'maxBytes' => (int) config('media.max_bytes'),
            'allowedTypes' => config('media.allowed_types'),
        ]);
    }

    /**
     * POST /admin/media — { dataUrl } -> { url }.
     *
     * Same contract the Node and API routes had, so the cropper needed no
     * rewrite beyond dropping React.
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
            Log::error('[admin/media] upload failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Upload failed'], 500);
        }
    }

    /** DELETE /admin/media/{id} */
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
     * POST /admin/media/migrate — move inline base64 images into the media
     * store. Idempotent, and safe to run on a live site.
     */
    public function migrate(): JsonResponse
    {
        try {
            $replaced = $this->media->migrateInlineImages();

            return response()->json([
                'ok' => true,
                'replaced' => $replaced,
                'message' => $replaced
                    ? sprintf(
                        'Optimised %d image%s. Refresh the site to see faster loads.',
                        $replaced,
                        $replaced === 1 ? '' : 's',
                    )
                    : 'All images are already optimised.',
            ]);
        } catch (\Throwable $e) {
            Log::error('[admin/media/migrate] failed', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Migration failed'], 500);
        }
    }
}
