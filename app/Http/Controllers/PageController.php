<?php

namespace App\Http\Controllers;

use App\Services\ContentService;
use App\Support\Site;
use Illuminate\Contracts\View\View;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The public site.
 *
 * Every page reads the content document straight from MongoDB through
 * ContentService — no HTTP hop, no API client, no second deployment. Field
 * visibility is already applied by the service, so a switched-off value arrives
 * blank and the view renders nothing for it.
 */
class PageController extends Controller
{
    public function __construct(private readonly ContentService $content) {}

    /** GET / — the landing page. */
    public function home(): View
    {
        $content = $this->content->publicContent();

        return view('pages.home', [
            'content' => $content,
            'meta' => [
                'title' => Site::NAME.' — '.Site::TAGLINE,
                'description' => Site::DESCRIPTION,
                'canonical' => url('/'),
            ],
        ]);
    }

    /** GET /blog — the article index. */
    public function blog(): View
    {
        $content = $this->content->publicContent();

        return view('pages.blog-index', [
            'content' => $content,
            'blogs' => $content['blogs'] ?? [],
            'meta' => [
                'title' => 'Blog — Insights from the studio · '.Site::NAME,
                'description' => 'Field notes on design, engineering and shipping AI products from the Tekoovi team.',
                'canonical' => url(Site::BLOG_BASE),
            ],
        ]);
    }

    /** GET /blog/{slug} — one article, with its neighbours for the pager. */
    public function blogPost(string $slug): View
    {
        $content = $this->content->publicContent();
        $blogs = array_values($content['blogs'] ?? []);

        [$blog, $index] = Site::findBySlug($blogs, $slug, fn (array $b) => Site::blogSlug($b));

        if (! $blog) {
            throw new NotFoundHttpException('Article not found');
        }

        return view('pages.blog-detail', [
            'content' => $content,
            'blog' => $blog,
            'prev' => $index > 0 ? $blogs[$index - 1] : null,
            'next' => $index < count($blogs) - 1 ? $blogs[$index + 1] : null,
            'meta' => [
                'title' => ($blog['title'] ?: 'Article').' · '.Site::NAME,
                'description' => $blog['excerpt'] ?? '',
                'canonical' => url(Site::blogHref($blog)),
                'image' => $blog['coverImage'] ?? '',
                'type' => 'article',
            ],
        ]);
    }

    /** GET /work-detail/{slug} — the "Selected Work" case study layout. */
    public function workDetail(string $slug): View
    {
        [$content, $project, $next] = $this->project($slug);

        return view('pages.work-detail', [
            'content' => $content,
            'project' => $project,
            'next' => $next,
            'meta' => [
                'title' => trim(($project['name'] ?? '').' — '.($project['category'] ?? ''), ' —').' · '.Site::NAME,
                'description' => $project['description'] ?? '',
                'canonical' => url(Site::projectHref($project)),
                'image' => $project['image'] ?? '',
                'type' => 'article',
            ],
        ]);
    }

    /** GET /case-study-detail/{slug} — the dedicated case-study layout. */
    public function caseStudyDetail(string $slug): View
    {
        [$content, $project, $next] = $this->project($slug);

        return view('pages.case-study-detail', [
            'content' => $content,
            'project' => $project,
            'next' => $next,
            'meta' => [
                'title' => ($project['name'] ?? 'Project').' — Case Study · '.Site::NAME,
                'description' => $project['description'] ?? '',
                'canonical' => url(Site::caseStudyHref($project)),
                'image' => $project['image'] ?? '',
                'type' => 'article',
            ],
        ]);
    }

    /** GET /privacy and GET /terms — the two legal pages share one view. */
    public function legal(string $page): View
    {
        $content = $this->content->publicContent();
        $meta = $content[$page] ?? [];

        return view('pages.legal', [
            'content' => $content,
            'eyebrow' => 'Legal',
            'legal' => $meta,
            'clauses' => $content[$page.'Clauses'] ?? [],
            'meta' => [
                'title' => ($meta['title'] ?: ucfirst($page)).' · '.Site::NAME,
                'description' => $meta['intro'] ?? '',
                'canonical' => url('/'.$page),
            ],
        ]);
    }

    /* ----------------------------- internals ---------------------------- */

    /**
     * Resolve a project by slug plus the one that follows it.
     *
     * The list wraps around, so the last case study still points somewhere.
     *
     * @return array{0: array, 1: array, 2: ?array}
     */
    private function project(string $slug): array
    {
        $content = $this->content->publicContent();
        $projects = array_values($content['projects'] ?? []);

        [$project, $index] = Site::findBySlug($projects, $slug, fn (array $p) => Site::projectSlug($p));

        if (! $project) {
            throw new NotFoundHttpException('Case study not found');
        }

        $next = count($projects) > 1 ? $projects[($index + 1) % count($projects)] : null;

        return [$content, $project, $next];
    }
}
