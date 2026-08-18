<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * An uploaded image, stored as its own document rather than inline in the
 * content — which is what keeps the content payload small on every page render.
 *
 *   { _id, contentType: "image/jpeg", data: BinData(0, ...),
 *     createdAt, updatedAt }
 *
 * `data` stays a BSON Binary (subtype 0), the same shape Mongoose's Buffer
 * wrote, so documents created before and after this migration are identical.
 */
class Media extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'media';

    public const CREATED_AT = 'createdAt';

    public const UPDATED_AT = 'updatedAt';

    protected $fillable = ['contentType', 'data'];
}
