<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    /**
     * GET /api/health — same shape the Node route returned, so any existing
     * uptime check keeps working.
     */
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection('mongodb')->getMongoDB()->command(['ping' => 1]);

            return response()->json([
                'success' => true,
                'mongo' => 'connected',
                'hasUri' => filled(config('database.connections.mongodb.dsn')),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => app()->hasDebugModeEnabled() ? $e->getMessage() : 'Database unavailable',
            ], 500);
        }
    }
}
