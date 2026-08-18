<?php

namespace Tests\Feature;

use App\Repositories\ContentRepository;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    private const PROBE_SECTION = 'logos';
    private const EMAIL = 'tests@example.com';
    private const PASSWORD = 'test-only-password';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'admin.email' => self::EMAIL,
            'admin.password' => null,
            'admin.password_hash' => bcrypt(self::PASSWORD),
        ]);
    }

    private function signIn(): self
    {
        $this->post('/admin/login', [
            'email' => self::EMAIL,
            'password' => self::PASSWORD,
        ])->assertRedirect('/admin');

        return $this;
    }

    /* ------------------------------- auth ------------------------------- */

    public function test_the_panel_is_closed_to_anonymous_visitors(): void
    {
        $this->get('/admin')->assertRedirect(route('admin.login'));
        $this->get('/admin/section/hero')->assertRedirect(route('admin.login'));
        $this->get('/admin/media')->assertRedirect(route('admin.login'));
    }

    public function test_writes_are_closed_to_anonymous_visitors(): void
    {
        $this->postJson('/admin/blocks', ['key' => 'faq', 'on' => false])->assertUnauthorized();
        $this->postJson('/admin/media', ['dataUrl' => 'x'])->assertUnauthorized();
        $this->postJson('/admin/media/migrate')->assertUnauthorized();
    }

    public function test_a_wrong_password_does_not_sign_anyone_in(): void
    {
        $this->post('/admin/login', [
            'email' => self::EMAIL,
            'password' => 'definitely-not-the-password',
        ])->assertSessionHasErrors('email');

        $this->get('/admin')->assertRedirect(route('admin.login'));
    }

    public function test_a_wrong_email_does_not_sign_anyone_in(): void
    {
        $this->post('/admin/login', [
            'email' => 'someone-else@example.com',
            'password' => self::PASSWORD,
        ])->assertSessionHasErrors('email');
    }

    public function test_the_right_credentials_open_the_dashboard(): void
    {
        $this->signIn()->get('/admin')->assertOk()->assertSee('Landing page admin');
    }

    public function test_logging_out_closes_the_panel_again(): void
    {
        $this->signIn();

        $this->post('/admin/logout')->assertRedirect(route('admin.login'));
        $this->get('/admin')->assertRedirect(route('admin.login'));
    }

    /* ----------------------------- sections ----------------------------- */

    public function test_every_section_renders(): void
    {
        $this->signIn();

        foreach (\App\Support\Sections::navigable() as $key => $definition) {
            $this->get('/admin/section/' . $key)
                ->assertOk()
                ->assertSee($definition['label'], false);
        }
    }

    public function test_an_unknown_section_is_a_404(): void
    {
        $this->signIn()->get('/admin/section/not-a-section')->assertNotFound();
    }

    /* ------------------------------- CRUD ------------------------------- */

    public function test_an_item_can_be_added_edited_and_deleted(): void
    {
        $this->signIn();
        $repository = app(ContentRepository::class);
        $before = count($repository->section(self::PROBE_SECTION));

        // add
        $this->post('/admin/section/' . self::PROBE_SECTION, [
            'name' => 'PHPUnit probe',
            'hiddenFields' => '',
        ])->assertRedirect(route('admin.section', self::PROBE_SECTION));

        $items = app(ContentRepository::class)->section(self::PROBE_SECTION);
        $this->assertCount($before + 1, $items);

        $probe = collect($items)->firstWhere('name', 'PHPUnit probe');
        $this->assertNotNull($probe, 'the new item should be stored');

        // edit, and switch the name off while we are here
        $this->put('/admin/section/' . self::PROBE_SECTION . '/' . $probe['id'], [
            'name' => 'PHPUnit probe edited',
            'hiddenFields' => 'name',
        ])->assertRedirect(route('admin.section', self::PROBE_SECTION));

        $edited = collect(app(ContentRepository::class)->section(self::PROBE_SECTION))
            ->firstWhere('id', $probe['id']);
        $this->assertSame('PHPUnit probe edited', $edited['name']);
        $this->assertSame(['name'], $edited['hiddenFields']);

        // the switched-off value is blanked for the public site, not deleted
        $public = app(\App\Services\ContentService::class)->publicContent();
        $publicProbe = collect($public[self::PROBE_SECTION])->firstWhere('id', $probe['id']);
        $this->assertSame('', $publicProbe['name']);

        // delete
        $this->delete('/admin/section/' . self::PROBE_SECTION . '/' . $probe['id'])
            ->assertRedirect(route('admin.section', self::PROBE_SECTION));

        $this->assertCount($before, app(ContentRepository::class)->section(self::PROBE_SECTION));
    }

    public function test_an_empty_item_is_rejected(): void
    {
        $this->signIn();
        $before = count(app(ContentRepository::class)->section(self::PROBE_SECTION));

        $this->post('/admin/section/' . self::PROBE_SECTION, ['name' => '', 'hiddenFields' => ''])
            ->assertSessionHasErrors('form');

        $this->assertCount($before, app(ContentRepository::class)->section(self::PROBE_SECTION));
    }

    public function test_a_singleton_saves_in_place(): void
    {
        $this->signIn();
        $repository = app(ContentRepository::class);
        $original = $repository->singleton('contact');

        $this->put('/admin/section/contact', [
            'email' => 'phpunit@example.com',
            'whatsapp' => $original['whatsapp'] ?? '',
            'calendly' => $original['calendly'] ?? '',
            'hiddenFields' => '',
        ])->assertRedirect(route('admin.section', 'contact'));

        $this->assertSame(
            'phpunit@example.com',
            app(ContentRepository::class)->singleton('contact')['email'],
        );

        // put it back exactly as it was
        $this->put('/admin/section/contact', [
            'email' => $original['email'] ?? '',
            'whatsapp' => $original['whatsapp'] ?? '',
            'calendly' => $original['calendly'] ?? '',
            'hiddenFields' => implode(',', $original['hiddenFields'] ?? []),
        ]);

        $this->assertSame(
            $original['email'] ?? '',
            app(ContentRepository::class)->singleton('contact')['email'],
        );
    }

    public function test_a_legal_page_header_saves_from_its_clause_section(): void
    {
        $this->signIn();
        $repository = app(ContentRepository::class);
        $original = $repository->singleton('privacy');

        $this->get('/admin/section/privacyClauses')
            ->assertOk()
            ->assertSee('Page header');

        $this->put('/admin/section/privacy', [
            'title' => 'PHPUnit privacy title',
            'intro' => $original['intro'] ?? '',
            'updated' => $original['updated'] ?? '',
            'hiddenFields' => '',
        ])->assertRedirect(route('admin.section', 'privacy'));

        $this->assertSame(
            'PHPUnit privacy title',
            app(ContentRepository::class)->singleton('privacy')['title'],
        );
        $this->get('/privacy')->assertOk()->assertSee('PHPUnit privacy title', false);

        // put it back exactly as it was
        $this->put('/admin/section/privacy', [
            'title' => $original['title'] ?? '',
            'intro' => $original['intro'] ?? '',
            'updated' => $original['updated'] ?? '',
            'hiddenFields' => implode(',', $original['hiddenFields'] ?? []),
        ]);

        $this->assertSame(
            $original['title'] ?? '',
            app(ContentRepository::class)->singleton('privacy')['title'],
        );
    }

    /* --------------------------- page blocks ---------------------------- */

    public function test_a_landing_page_block_can_be_switched_off_and_back_on(): void
    {
        $this->signIn();

        $this->postJson('/admin/blocks', ['key' => 'faq', 'on' => false])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->get('/')->assertOk()->assertDontSee('id="faq"', false);

        $this->postJson('/admin/blocks', ['key' => 'faq', 'on' => true])
            ->assertOk()
            ->assertJson(['ok' => true]);

        $this->get('/')->assertOk()->assertSee('id="faq"', false);
    }

    public function test_an_unknown_block_is_rejected(): void
    {
        $this->signIn()
            ->postJson('/admin/blocks', ['key' => 'not-a-block', 'on' => false])
            ->assertNotFound();
    }

    /* ------------------------------ media ------------------------------- */

    public function test_an_image_can_be_uploaded_served_and_deleted(): void
    {
        $this->signIn();
        $dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

        $response = $this->postJson('/admin/media', ['dataUrl' => $dataUrl])->assertCreated();
        $url = $response->json('url');
        $this->assertStringContainsString('/api/media/', $url);

        // public, and the bytes come back as a PNG
        $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/png');

        $id = basename($url);
        $this->deleteJson('/admin/media/' . $id)->assertOk()->assertJson(['ok' => true]);
        $this->get($url)->assertNotFound();
    }

    public function test_a_non_image_payload_is_rejected(): void
    {
        $this->signIn();

        $this->postJson('/admin/media', ['dataUrl' => 'data:text/html;base64,PHA+aGk8L3A+'])
            ->assertStatus(422);

        $this->postJson('/admin/media', ['dataUrl' => ''])->assertStatus(400);
    }

    public function test_a_malformed_media_id_is_rejected(): void
    {
        $this->signIn();

        $this->deleteJson('/admin/media/not-an-object-id')->assertStatus(400);
        $this->get('/api/media/not-an-object-id')->assertNotFound();
    }

    public function test_the_media_library_lists_uploads(): void
    {
        $this->signIn()->get('/admin/media')->assertOk()->assertSee('Media library');
    }
}
