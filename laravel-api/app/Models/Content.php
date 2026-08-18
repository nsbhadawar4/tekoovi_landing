<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * The single content document, exactly as the Node backend stored it.
 *
 *   { _id, key: "landing", data: { hero: {...}, projects: [...], ... },
 *     createdAt, updatedAt }
 *
 * Timestamp column names are overridden to Mongoose's camelCase so Laravel
 * keeps writing the same fields the existing documents already use.
 */
class Content extends Model
{
    protected $connection = 'mongodb';

    // `$table` is what mongodb/laravel-mongodb reads — naming this wrong makes
    // Eloquent invent a pluralised collection instead of using the real one.
    protected $table = 'content';

    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    /** The one document key the site reads. */
    public const LANDING = 'landing';

    protected $fillable = ['key', 'data'];

    protected $casts = [
        'data' => 'array',
    ];
}
