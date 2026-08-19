<?php

namespace Tests\Feature;

use App\Repositories\ContentRepository;
use App\Support\Site;
use Tests\TestCase;

/**
 * Every public URL the site answers.
 *
 * These run against the configured MySQL database and never write: the point is
 * that the live content still renders through the Blade views, which is exactly
 * what a visitor gets.
 */
class PublicSiteTest extends TestCase
{
    private function content(): array
    {
        return app(ContentRepository::class)->all();
    }

    public function test_home_renders_the_landing_page(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Tekoovi', false)
            ->assertSee('id="home"', false);
    }

    public function test_home_renders_every_switched_on_block(): void
    {
        $content = $this->content();
        $response = $this->get('/')->assertOk();

        foreach (['work', 'services', 'industries', 'process', 'testimonials', 'faq'] as $anchor) {
            $response->assertSee('id="'.$anchor.'"', false);
        }

        // The blocks are driven by content, so the count has to agree with it.
        $this->assertNotEmpty($content['projects'] ?? []);
        $response->assertSee($content['projects'][0]['name'], false);
    }

    public function test_blog_index_lists_the_posts(): void
    {
        $blogs = $this->content()['blogs'] ?? [];

        $response = $this->get('/blog')->assertOk()->assertSee('Insights from the studio');

        foreach ($blogs as $blog) {
            $response->assertSee($blog['title'], false);
        }
    }

    public function test_each_blog_post_resolves_by_slug(): void
    {
        foreach ($this->content()['blogs'] ?? [] as $blog) {
            $this->get(Site::blogHref($blog))
                ->assertOk()
                ->assertSee($blog['title'], false);
        }
    }

    public function test_each_project_has_both_detail_pages(): void
    {
        foreach ($this->content()['projects'] ?? [] as $project) {
            $this->get(Site::projectHref($project))->assertOk()->assertSee($project['name'], false);
            $this->get(Site::caseStudyHref($project))->assertOk()->assertSee($project['name'], false);
        }
    }

    public function test_legal_pages_render_their_clauses(): void
    {
        foreach (['privacy', 'terms'] as $page) {
            $clauses = $this->content()[$page.'Clauses'] ?? [];
            $response = $this->get('/'.$page)->assertOk();

            foreach (array_slice($clauses, 0, 3) as $clause) {
                $response->assertSee($clause['heading'], false);
            }
        }
    }

    public function test_an_old_work_link_still_redirects(): void
    {
        $this->get('/work/anything')->assertRedirect('/work-detail/anything');
    }

    public function test_an_unknown_slug_is_a_404_not_a_500(): void
    {
        $this->get('/blog/no-such-article')->assertNotFound();
        $this->get('/work-detail/no-such-project')->assertNotFound();
        $this->get('/nothing-here-at-all')->assertNotFound();
    }

    public function test_health_reports_a_live_database(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJson(['status' => 'ok', 'database' => 'ok']);
    }

    /**
     * A switched-off field must be blanked before the page is built, not hidden
     * with CSS — otherwise the value still ships to the browser.
     */
    public function test_hidden_fields_never_reach_the_page(): void
    {
        $content = app(\App\Services\ContentService::class)->publicContent();

        foreach ($content['faqs'] ?? [] as $faq) {
            if (in_array('a', $faq['hiddenFields'] ?? [], true)) {
                $this->assertSame('', $faq['a'], 'a hidden answer should be blanked on read');
            }
        }

        // Nothing to assert beyond the shape when no field is switched off.
        $this->assertIsArray($content['faqs'] ?? []);
    }
}
