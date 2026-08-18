<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Support\Sections;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Content endpoints.
 *
 * Every route mirrors the Node original — same paths, same methods, same JSON
 * keys and status codes — so the existing admin UI needed no rewrite.
 */
class ContentController extends Controller
{
    public function __construct(private readonly ContentService $content) {}

    /**
     * GET /api/content — the whole document for the public site.
     *
     * Visibility is applied here (switched-off fields are blanked), so hidden
     * content never leaves the server.
     */
    public function all(): JsonResponse
    {
        return response()->json(['data' => $this->content->publicContent()]);
    }

    /**
     * GET /api/content/{section}
     *   collection -> { items: [...] }      singleton -> { item: {...} }
     *
     * Public, as before: the admin reads raw values from the same route.
     */
    public function show(string $section): JsonResponse
    {
        if (! Sections::exists($section)) {
            return response()->json(['error' => 'Unknown section'], 404);
        }

        return Sections::isSingleton($section)
            ? response()->json(['item' => $this->content->getSingleton($section)])
            : response()->json(['items' => $this->content->listSection($section)]);
    }

    /** POST /api/content/{section} — add an item to a collection (admin only). */
    public function store(Request $request, string $section): JsonResponse
    {
        if (! Sections::exists($section)) {
            return response()->json(['error' => 'Unknown section'], 404);
        }

        $result = $this->content->createItem($section, $request->all());

        if (! $result['ok']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json(['item' => $result['item']], 201);
    }

    /** PUT /api/content/{section} — edit a singleton in place (admin only). */
    public function update(Request $request, string $section): JsonResponse
    {
        if (! Sections::exists($section)) {
            return response()->json(['error' => 'Unknown section'], 404);
        }

        $result = $this->content->editSingleton($section, $request->all());

        if (! $result['ok']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json(['item' => $result['item']]);
    }

    /** PUT /api/content/{section}/{id} — edit one item (admin only). */
    public function updateItem(Request $request, string $section, string $id): JsonResponse
    {
        if (! Sections::exists($section)) {
            return response()->json(['error' => 'Unknown section'], 404);
        }

        $result = $this->content->editItem($section, $id, $request->all());

        if (! $result['ok']) {
            return response()->json(['error' => $result['error']], $result['status']);
        }

        return response()->json(['item' => $result['item']]);
    }

    /** DELETE /api/content/{section}/{id} — remove one item (admin only). */
    public function destroyItem(string $section, string $id): JsonResponse
    {
        if (! Sections::exists($section)) {
            return response()->json(['error' => 'Unknown section'], 404);
        }

        if (! $this->content->deleteItem($section, $id)) {
            return response()->json(['error' => 'Item not found.'], 404);
        }

        return response()->json(['ok' => true]);
    }
}
