<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The content store: one row per page key, holding that page's whole section
 * tree in a JSON column.
 *
 * This is deliberately not shredded into a table per section. The admin studio
 * is driven by a registry (config/sections.php + App\Support\Sections) where a
 * section is a free-form list of items or a singleton block, each with its own
 * field set and its own per-record `hiddenFields` list — the shape changes when
 * the registry changes, with no migration. Twenty-three of those sections are
 * read together on every page render, so one row keyed "landing" is also one
 * query. MySQL's JSON type keeps the exact structure the MongoDB document had,
 * which is what lets the repository, the services and every Blade view carry on
 * untouched.
 *
 * Timestamp columns keep the camelCase names the existing documents used, so
 * the imported rows and the models stay in step.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content', function (Blueprint $table) {
            $table->id();
            // "landing" today; a second page would be a second row.
            $table->string('key', 64)->unique();
            $table->json('data')->nullable();
            $table->timestamp('createdAt')->nullable();
            $table->timestamp('updatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content');
    }
};
