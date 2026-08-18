<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * The API contract the Next.js frontend depends on.
 *
 * These assert the *shape* the old Node routes returned — the same JSON keys
 * and status codes — because the frontend was left untouched and reads them
 * verbatim. They run against the configured MongoDB and only ever write to a
 * throwaway item they clean up themselves.
 */
class ApiContractTest extends TestCase
{
    private const PROBE_SECTION = 'logos';

    /**
     * Sign in and return the session token.
     *
     * Tests present it as a Bearer header rather than a cookie — the middleware
     * accepts either, and this is the same path a cross-site deployment uses.
     */
    private function login(): string
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => config('admin.email'),
            'password' => config('admin.password'),
        ]);

        $response->assertOk()->assertJson(['ok' => true]);

        return $response->json('token');
    }

    /* ------------------------------ public ----------------------------- */

    public function test_health_reports_a_live_database(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['success' => true, 'mongo' => 'connected']);
    }

    public function test_whole_content_document_is_public(): void
    {
        $response = $this->getJson('/api/content')->assertOk();

        $data = $response->json('data');
        $this->assertIsArray($data);
        $this->assertArrayHasKey('hero', $data);
        $this->assertArrayHasKey('projects', $data);
    }

    public function test_singleton_and_collection_shapes(): void
    {
        // Singletons answer with `item`, collections with `items` — the admin
        // branches on exactly this.
        $this->getJson('/api/content/hero')
            ->assertOk()
            ->assertJsonStructure(['item']);

        $this->getJson('/api/content/projects')
            ->assertOk()
            ->assertJsonStructure(['items']);
    }

    public function test_unknown_section_is_a_404(): void
    {
        $this->getJson('/api/content/not-a-section')
            ->assertStatus(404)
            ->assertJson(['error' => 'Unknown section']);
    }

    public function test_media_serves_bytes_and_rejects_bad_ids(): void
    {
        $this->get('/api/media/not-an-object-id')->assertStatus(404);
    }

    /* ------------------------------- auth ------------------------------ */

    public function test_login_rejects_a_wrong_password(): void
    {
        $this->postJson('/api/admin/login', [
            'email' => config('admin.email'),
            'password' => 'definitely-not-the-password',
        ])
            ->assertStatus(401)
            ->assertJson(['ok' => false]);
    }

    public function test_writes_require_a_session(): void
    {
        $this->putJson('/api/content/hero', ['badge' => 'nope'])
            ->assertStatus(401)
            ->assertJson(['error' => 'Unauthorized']);

        $this->postJson('/api/content/logos', ['name' => 'nope'])
            ->assertStatus(401);

        $this->postJson('/api/media', ['dataUrl' => 'x'])
            ->assertStatus(401);
    }

    public function test_session_endpoint_reflects_the_cookie(): void
    {
        $this->getJson('/api/admin/session')->assertStatus(401);

        $this->withToken($this->login())
            ->getJson('/api/admin/session')
            ->assertOk()
            ->assertJson(['authenticated' => true]);
    }

    /* ------------------------------ content ---------------------------- */

    public function test_item_lifecycle_create_update_delete(): void
    {
        $token = $this->login();

        $created = $this->withToken($token)
            ->postJson('/api/content/'.self::PROBE_SECTION, ['name' => 'ZZ Contract Test'])
            ->assertStatus(201)
            ->assertJsonStructure(['item' => ['id', 'name']]);

        $id = $created->json('item.id');

        try {
            // A comma-joined hidden list arrives as an array, as the admin sends it.
            $this->withToken($token)
                ->putJson('/api/content/'.self::PROBE_SECTION."/{$id}", [
                    'name' => 'ZZ Contract Test 2',
                    'hiddenFields' => 'name',
                ])
                ->assertOk()
                ->assertJson(['item' => [
                    'id' => $id,
                    'name' => 'ZZ Contract Test 2',
                    'hiddenFields' => ['name'],
                ]]);

            // Hidden fields are blanked for the public site but kept in storage.
            $public = collect($this->getJson('/api/content')->json('data.'.self::PROBE_SECTION))
                ->firstWhere('id', $id);
            $this->assertSame('', $public['name'], 'A hidden field must not reach the site.');

            $raw = collect($this->getJson('/api/content/'.self::PROBE_SECTION)->json('items'))
                ->firstWhere('id', $id);
            $this->assertSame('ZZ Contract Test 2', $raw['name'], 'The admin must still see the value.');
        } finally {
            $this->withToken($token)
                ->deleteJson('/api/content/'.self::PROBE_SECTION."/{$id}")
                ->assertOk()
                ->assertJson(['ok' => true]);
        }

        $this->withToken($token)
            ->deleteJson('/api/content/'.self::PROBE_SECTION."/{$id}")
            ->assertStatus(404);
    }

    public function test_creating_an_empty_item_is_rejected(): void
    {
        $this->withToken($this->login())
            ->postJson('/api/content/'.self::PROBE_SECTION, ['name' => ''])
            ->assertStatus(400)
            ->assertJson(['error' => 'Please fill at least one field.']);
    }

    /* ------------------------------- media ----------------------------- */

    public function test_media_upload_serve_and_delete(): void
    {
        $token = $this->login();
        $png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        $url = $this->withToken($token)
            ->postJson('/api/media', ['dataUrl' => $png])
            ->assertStatus(201)
            ->json('url');

        $id = basename((string) $url);

        try {
            $this->get("/api/media/{$id}")
                ->assertOk()
                ->assertHeader('Content-Type', 'image/png');
        } finally {
            $this->withToken($token)
                ->deleteJson("/api/media/{$id}")
                ->assertOk();
        }
    }

    public function test_media_rejects_non_images_and_empty_bodies(): void
    {
        $token = $this->login();

        $this->withToken($token)
            ->postJson('/api/media', ['dataUrl' => 'data:text/html;base64,PHNjcmlwdD4='])
            ->assertStatus(422);

        $this->withToken($token)
            ->postJson('/api/media', [])
            ->assertStatus(400)
            ->assertJson(['error' => 'No image data.']);
    }
}
