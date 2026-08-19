<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * The single content row, carrying the whole section tree.
 *
 *   { id, key: "landing", data: { hero: {...}, projects: [...], ... },
 *     createdAt, updatedAt }
 *
 * `data` is a MySQL JSON column cast to an array, so the nested structure the
 * admin studio and every Blade view expect round-trips unchanged — the same
 * shape the MongoDB document held.
 *
 * Timestamp column names stay camelCase, matching the columns the migration
 * creates and the rows the one-time import wrote.
 */
class Content extends Model
{
    protected $table = 'content';

    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    /** The one row key the site reads. */
    public const LANDING = 'landing';

    protected $fillable = ['key', 'data'];

    protected function casts(): array
    {
        return [
            'data' => 'array',
        ];
    }
}
