<?php

namespace App\Support;

/**
 * Read-only helpers over config/sections.php.
 *
 * Everything that needs to know "is this a real section?", "what type is this
 * field?" or "can this field be hidden?" goes through here, so the rules live
 * in exactly one place.
 */
class Sections
{
    /** @return array<string, array{kind: string, fields: array<string, string>, noToggles?: bool}> */
    public static function all(): array
    {
        return config('sections.sections', []);
    }

    /** @return list<string> */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    public static function exists(string $section): bool
    {
        return array_key_exists($section, self::all());
    }

    /** @return array{kind: string, fields: array<string, string>, noToggles?: bool}|null */
    public static function definition(string $section): ?array
    {
        return self::all()[$section] ?? null;
    }

    public static function isSingleton(string $section): bool
    {
        return (self::definition($section)['kind'] ?? null) === 'singleton';
    }

    public static function isCollection(string $section): bool
    {
        return (self::definition($section)['kind'] ?? null) === 'collection';
    }

    /** @return array<string, string> field name => type */
    public static function fields(string $section): array
    {
        return self::definition($section)['fields'] ?? [];
    }

    public static function fieldType(string $section, string $field): ?string
    {
        return self::fields($section)[$field] ?? null;
    }

    /** The key inside a record that lists its switched-off fields. */
    public static function hiddenKey(): string
    {
        return config('sections.hidden_fields_key', 'hiddenFields');
    }

    /**
     * Field names in this section that the admin may switch off.
     *
     * @return list<string>
     */
    public static function toggleableFields(string $section): array
    {
        $definition = self::definition($section);
        if (! $definition || ($definition['noToggles'] ?? false)) {
            return [];
        }

        $blocked = config('sections.non_toggleable_types', []);

        return array_keys(array_filter(
            $definition['fields'],
            fn (string $type) => ! in_array($type, $blocked, true),
        ));
    }
}
