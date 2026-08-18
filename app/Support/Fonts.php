<?php

namespace App\Support;

/**
 * Selectable site fonts — the port of `frontend/lib/fonts.ts`.
 *
 * One source of truth for the font picker in /admin (Settings) and for applying
 * the chosen family on the site. `href` is a Google Fonts stylesheet loaded only
 * when that family is selected; null means no external load (the design default,
 * or a native system stack). Weights are limited to what each family actually
 * ships, so the Google Fonts API never 400s on a missing weight.
 */
class Fonts
{
    /** The default keeps the site's designed look (Inter body + Jakarta headings). */
    public const DEFAULT = 'inter';

    private const GF = 'https://fonts.googleapis.com/css2?family=';

    private const SANS = 'ui-sans-serif, system-ui, sans-serif';

    private const SERIF = 'ui-serif, Georgia, serif';

    /** @return list<array{value: string, label: string, stack: string, href: ?string}> */
    public static function all(): array
    {
        return [
            [
                'value' => 'inter',
                'label' => 'Inter (default)',
                'stack' => 'var(--font-inter), '.self::SANS,
                'href' => null,
            ],
            [
                'value' => 'system',
                'label' => 'System (native)',
                'stack' => 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                'href' => null,
            ],
            self::google('poppins', 'Poppins', 'Poppins', '400;500;600;700'),
            self::google('montserrat', 'Montserrat', 'Montserrat', '400;500;600;700'),
            self::google('roboto', 'Roboto', 'Roboto', '400;500;700'),
            self::google('open-sans', 'Open Sans', 'Open+Sans', '400;500;600;700'),
            self::google('lato', 'Lato', 'Lato', '400;700'),
            self::google('raleway', 'Raleway', 'Raleway', '400;500;600;700'),
            self::google('nunito', 'Nunito', 'Nunito', '400;500;600;700'),
            self::google('work-sans', 'Work Sans', 'Work+Sans', '400;500;600;700'),
            self::google('dm-sans', 'DM Sans', 'DM+Sans', '400;500;600;700'),
            self::google('space-grotesk', 'Space Grotesk', 'Space+Grotesk', '400;500;600;700'),
            self::google('manrope', 'Manrope', 'Manrope', '400;500;600;700'),
            self::google('playfair', 'Playfair Display (serif)', 'Playfair+Display', '400;500;600;700', serif: true),
            self::google('lora', 'Lora (serif)', 'Lora', '400;500;600;700', serif: true),
        ];
    }

    /** Choices for the admin's font `select` field. */
    public static function options(): array
    {
        return array_map(
            fn (array $font) => ['value' => $font['value'], 'label' => $font['label']],
            self::all(),
        );
    }

    /**
     * Resolve a stored font value to its definition, falling back to the default.
     *
     * @return array{value: string, label: string, stack: string, href: ?string}
     */
    public static function resolve(?string $value): array
    {
        $all = self::all();

        foreach ($all as $font) {
            if ($font['value'] === $value) {
                return $font;
            }
        }

        foreach ($all as $font) {
            if ($font['value'] === self::DEFAULT) {
                return $font;
            }
        }

        return $all[0];
    }

    /** Is this a real choice, or the design default that needs no override? */
    public static function isCustom(?string $value): bool
    {
        return self::resolve($value)['value'] !== self::DEFAULT;
    }

    /** @return array{value: string, label: string, stack: string, href: string} */
    private static function google(
        string $value,
        string $label,
        string $family,
        string $weights,
        bool $serif = false,
    ): array {
        $name = str_replace('+', ' ', $family);

        return [
            'value' => $value,
            'label' => $label,
            'stack' => sprintf('"%s", %s', $name, $serif ? self::SERIF : self::SANS),
            'href' => self::GF.$family.':wght@'.$weights.'&display=swap',
        ];
    }
}
