<?php

namespace App\Support;

use Illuminate\Support\HtmlString;

/**
 * Icon registry — the port of `frontend/lib/icons.ts`.
 *
 * Content stores an icon *name* (a plain string) so it can live in MongoDB.
 * Here that name resolves to the matching Lucide markup from config/lucide.php,
 * which the `<x-icon>` component wraps in an <svg>.
 */
class Icons
{
    /**
     * The names offered in the admin's icon picker.
     *
     * Same list, same order as the React `ICONS` map — the picker is a content
     * choice, so it must not silently gain every chrome icon the site uses.
     *
     * @return list<string>
     */
    public const PICKABLE = [
        'LayoutGrid', 'Server', 'BrainCircuit', 'Smartphone', 'Workflow', 'Palette',
        'LineChart', 'Wrench', 'Rocket', 'ShieldCheck', 'Sparkles', 'ScanSearch',
        'Boxes', 'HeartPulse', 'Building2', 'GraduationCap', 'Users', 'Landmark',
        'UtensilsCrossed', 'ShoppingBag', 'BadgeCheck', 'Code2', 'Cpu', 'Database',
        'Cloud', 'Globe', 'Lock', 'Layers', 'PenTool', 'Gauge', 'Target', 'Zap',
    ];

    /** Every icon the app can draw. */
    public static function all(): array
    {
        return config('lucide', []);
    }

    public static function exists(?string $name): bool
    {
        return $name !== null && array_key_exists($name, self::all());
    }

    /**
     * Markup for an icon, falling back to Sparkles exactly as `getIcon` did.
     *
     * The return is pre-escaped SVG from a file we control, never user input —
     * the name is only ever used as an array key.
     */
    public static function markup(?string $name): HtmlString
    {
        $icons = self::all();

        return new HtmlString($icons[$name] ?? $icons['Sparkles'] ?? '');
    }
}
