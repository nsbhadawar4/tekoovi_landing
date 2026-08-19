<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/health — is the app up, and can it reach MySQL?
 *
 * Kept for uptime monitoring on cheap hosting, where a failed deploy otherwise
 * shows up as a blank page rather than a signal.
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        try {
            Content::query()->where('key', Content::LANDING)->exists();
            $database = 'ok';
        } catch (\Throwable $e) {
            $database = 'unreachable';
        }

        return response()->json([
            'status' => $database === 'ok' ? 'ok' : 'degraded',
            'database' => $database,
        ], $database === 'ok' ? 200 : 503);
    }
}
