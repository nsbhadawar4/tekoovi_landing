<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Metadata for uploaded images. The bytes live on the filesystem.
 *
 * Two decisions worth knowing about:
 *
 *   id     a 24-character hex string, not an auto-increment. Every content
 *          record stores its images as "/api/media/<id>", so the ids already in
 *          the data have to keep resolving — an integer key would break every
 *          stored path. New uploads generate an id in the same format.
 *   path   where the file sits on the configured disk (`public` by default), so
 *          MySQL holds the pointer and the row stays a few dozen bytes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->char('id', 24)->primary();
            $table->string('contentType', 100);
            // Relative to the disk root, e.g. "media/<id>.png".
            $table->string('path');
            $table->unsignedBigInteger('size')->default(0);
            $table->string('disk', 32)->default('public');
            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();

            // The library lists newest first.
            $table->index('createdAt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
