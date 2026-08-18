<?php

namespace App\Support;

/**
 * Read-only helpers over config/sections.php.
 *
 * Everything that needs to know "is this a real section?", "what type is this
 * field?" or "can this field be hidden?" goes through here, so the rules live
 * in exactly one place — the public views, the admin forms and the write path
 * all read the same registry.
 */
class Sections
{
    /** Every section, including the legal headers that have no sidebar entry. */
    public static function all(): array
    {
        return config('sections.sections', []);
    }

    /** @return list<string> */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    /**
     * The sections the admin sidebar lists, in order.
     *
     * A legal page's header is edited through its clause section, so it's
     * resolvable by key but never listed on its own.
     */
    public static function navigable(): array
    {
        return array_filter(self::all(), fn (array $s) => ! ($s['hidden'] ?? false));
    }

    public static function exists(string $section): bool
    {
        return array_key_exists($section, self::all());
    }

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

    /** Field definitions, in form order. */
    public static function fields(string $section): array
    {
        return self::definition($section)['fields'] ?? [];
    }

    /** @return array<string, string> field name => type */
    public static function fieldTypes(string $section): array
    {
        $types = [];

        foreach (self::fields($section) as $field) {
            $types[$field['name']] = $field['type'];
        }

        return $types;
    }

    public static function fieldType(string $section, string $field): ?string
    {
        return self::fieldTypes($section)[$field] ?? null;
    }

    /** The first image field, used as the thumbnail in an admin list row. */
    public static function imageField(string $section): ?string
    {
        foreach (self::fields($section) as $field) {
            if ($field['type'] === 'image') {
                return $field['name'];
            }
        }

        return null;
    }

    /** The header singleton a collection edits above its list, if it has one. */
    public static function header(string $section): ?array
    {
        $header = self::definition($section)['header'] ?? null;

        if (! $header || ! self::exists($header['key'])) {
            return null;
        }

        return $header + self::definition($header['key']);
    }

    /** The key inside a record that lists its switched-off fields. */
    public static function hiddenKey(): string
    {
        return config('sections.hidden_fields_key', 'hiddenFields');
    }

    /**
     * Does this field get a show/hide switch?
     *
     * A boolean field is already a switch of its own — hiding it would only
     * duplicate what turning it off does.
     */
    public static function isToggleable(string $section, array $field): bool
    {
        if (self::definition($section)['noToggles'] ?? false) {
            return false;
        }

        return ! ($field['noToggle'] ?? false)
            && ! in_array($field['type'], config('sections.non_toggleable_types', []), true);
    }

    /**
     * Field names in this section the admin may switch off.
     *
     * @return list<string>
     */
    public static function toggleableFields(string $section): array
    {
        return array_values(array_map(
            fn (array $field) => $field['name'],
            array_filter(
                self::fields($section),
                fn (array $field) => self::isToggleable($section, $field),
            ),
        ));
    }

    /* ------------------------- landing-page blocks ------------------------ */

    /** @return list<array{key: string, label: string, hint: string}> */
    public static function pageBlocks(): array
    {
        return config('sections.page_blocks', []);
    }

    public static function block(string $key): ?array
    {
        foreach (self::pageBlocks() as $block) {
            if ($block['key'] === $key) {
                return $block;
            }
        }

        return null;
    }

    /**
     * Is this landing-page block switched on?
     *
     * A key with no stored value counts as shown, so a block added to the
     * registry later appears on the page until someone deliberately turns it off.
     */
    public static function isBlockVisible(?array $pageSections, string $key): bool
    {
        return ($pageSections[$key] ?? null) !== false;
    }

    /**
     * Is this record's field switched off?
     *
     * Hidden values are blanked on read, so a plain truthiness check is usually
     * enough. Reach for this only where the blank value has a meaning of its own
     * (a fallback avatar, a default author name) and must not be shown either.
     */
    public static function isHidden(?array $record, string $field): bool
    {
        $hidden = $record[self::hiddenKey()] ?? [];

        return is_array($hidden) && in_array($field, $hidden, true);
    }
}
