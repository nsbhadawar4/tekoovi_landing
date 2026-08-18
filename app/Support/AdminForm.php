<?php

namespace App\Support;

/**
 * Turns a stored record into the flat values an admin form renders.
 *
 * The port of `buildForm` from the React dashboard: every field becomes one
 * string (or a "1"/"0" for a switch), which is exactly what an HTML form posts
 * and what ContentService::sanitize expects back.
 */
class AdminForm
{
    /**
     * The value to render into a field's input.
     *
     * Old input wins after a failed save, so nothing the operator typed is lost.
     */
    public static function value(array $field, array $record): string
    {
        $name = $field['name'];
        $old = old($name);

        if ($old !== null) {
            return is_array($old) ? implode(', ', $old) : (string) $old;
        }

        $value = $record[$name] ?? null;

        return match ($field['type']) {
            // A switch nobody has touched falls back to the field's default, so
            // "on unless turned off" survives a record that predates the field.
            'boolean' => ($value === null ? ($field['default'] ?? false) : $value) === true ? '1' : '0',
            'tags' => is_array($value) ? implode(', ', $value) : (string) ($value ?? ''),
            default => $value === null ? '' : (string) $value,
        };
    }

    /**
     * The comma-joined list of switched-off field names for this record.
     *
     * One hidden input carries it, which keeps the posted body flat.
     */
    public static function hiddenFields(array $record): string
    {
        $old = old(Sections::hiddenKey());

        if ($old !== null) {
            return is_array($old) ? implode(',', $old) : (string) $old;
        }

        $hidden = $record[Sections::hiddenKey()] ?? [];

        return is_array($hidden) ? implode(',', $hidden) : '';
    }

    /** How many fields this record has switched off. */
    public static function hiddenCount(array $record): int
    {
        $hidden = $record[Sections::hiddenKey()] ?? [];

        return is_array($hidden) ? count($hidden) : 0;
    }

    /**
     * Group consecutive fields that share a `group` id into one card.
     *
     * The singleton editors render each field in its own card, except that a
     * run of grouped fields (the theme pair, the page-block switches) reads as
     * a single control panel.
     *
     * @return list<array{key: string, fields: list<array>}>
     */
    public static function cards(array $fields): array
    {
        $cards = [];

        foreach ($fields as $field) {
            $group = $field['group'] ?? null;
            $last = $cards === [] ? null : $cards[count($cards) - 1];

            if ($group !== null && ($last['group'] ?? null) === $group) {
                $cards[count($cards) - 1]['fields'][] = $field;

                continue;
            }

            $cards[] = [
                'key' => $group !== null ? 'g:'.$group : 'f:'.$field['name'],
                'group' => $group,
                'fields' => [$field],
            ];
        }

        return $cards;
    }
}
