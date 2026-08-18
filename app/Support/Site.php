<?php

namespace App\Support;

/**
 * Site-level constants and URL helpers.
 *
 * Ports `frontend/lib/data.ts` (navigation), `frontend/lib/projects.ts` and
 * `frontend/lib/blog.ts` (slugs and hrefs) and `frontend/lib/utils.ts`
 * (slugify). Item slugs must keep producing the same strings the Next.js app
 * produced, or every existing link into a case study or article breaks.
 */
class Site
{
    public const NAME = 'Tekoovi';

    public const URL = 'https://tekoovi.com';

    public const TAGLINE = 'We build digital products that scale businesses.';

    public const DESCRIPTION = 'Tekoovi is a premium digital product studio. We design and engineer scalable custom websites, SaaS platforms, AI-powered solutions, mobile apps, and automation systems for founders and enterprises.';

    /** Route bases, kept as constants so a rename happens in one place. */
    public const WORK_BASE = '/work-detail';

    public const CASE_STUDY_BASE = '/case-study-detail';

    public const BLOG_BASE = '/blog';

    public const THEME_STORAGE_KEY = 'tekoovi-theme';

    /**
     * Structural navigation.
     *
     * Each link points at a landing-page section anchor; `block` names the
     * landing-page block it scrolls to. When that block is switched off in the
     * admin its anchor no longer exists, so the link goes with it. Links with no
     * block are always shown.
     *
     * @return list<array{label: string, href: string, block?: string}>
     */
    public static function navLinks(): array
    {
        return [
            ['label' => 'Home', 'href' => '#home', 'block' => 'hero'],
            ['label' => 'Work', 'href' => '#work', 'block' => 'work'],
            ['label' => 'Services', 'href' => '#services', 'block' => 'services'],
            ['label' => 'Process', 'href' => '#process', 'block' => 'process'],
            ['label' => 'Studio', 'href' => '#studio', 'block' => 'founder'],
            ['label' => 'Blog', 'href' => '#blog', 'block' => 'blog'],
            ['label' => 'FAQ', 'href' => '#faq', 'block' => 'faq'],
        ];
    }

    /** The nav links whose landing-page section is switched on. */
    public static function visibleNavLinks(?array $pageSections): array
    {
        return array_values(array_filter(
            self::navLinks(),
            fn (array $link) => ! isset($link['block'])
                || Sections::isBlockVisible($pageSections, $link['block']),
        ));
    }

    /* ------------------------------ slugs ------------------------------- */

    /** URL/anchor-safe slug. Empty or symbol-only input falls back to `$fallback`. */
    public static function slugify(string $value, string $fallback = 'item'): string
    {
        $slug = preg_replace('/[^a-z0-9]+/', '-', mb_strtolower($value));
        $slug = trim((string) $slug, '-');

        return $slug !== '' ? $slug : $fallback;
    }

    public static function projectSlug(array $project): string
    {
        return self::slugify((string) ($project['name'] ?? ''), (string) ($project['id'] ?? 'item'));
    }

    public static function blogSlug(array $blog): string
    {
        return self::slugify((string) ($blog['title'] ?? ''), (string) ($blog['id'] ?? 'item'));
    }

    /** Link to the project's "Selected Work" detail page. */
    public static function projectHref(array $project): string
    {
        return self::WORK_BASE.'/'.self::projectSlug($project);
    }

    /** Link to the project's dedicated case-study detail page (its own UI). */
    public static function caseStudyHref(array $project): string
    {
        return self::CASE_STUDY_BASE.'/'.self::projectSlug($project);
    }

    public static function blogHref(array $blog): string
    {
        return self::BLOG_BASE.'/'.self::blogSlug($blog);
    }

    /**
     * Find a record by slug, falling back to the raw id so old links keep working.
     *
     * @return array{0: ?array, 1: int} the record and its index, or [null, -1]
     */
    public static function findBySlug(array $items, string $slug, callable $slugFor): array
    {
        foreach (array_values($items) as $index => $item) {
            if ($slugFor($item) === $slug || ($item['id'] ?? null) === $slug) {
                return [$item, $index];
            }
        }

        return [null, -1];
    }

    /** Cover + gallery images, de-duped and empties removed (feeds the slider). */
    public static function blogImages(array $blog): array
    {
        $images = array_map(
            fn (?string $src) => trim((string) $src),
            [
                $blog['coverImage'] ?? '',
                $blog['image1'] ?? '',
                $blog['image2'] ?? '',
                $blog['image3'] ?? '',
            ],
        );

        return array_values(array_unique(array_filter($images, fn (string $src) => $src !== '')));
    }

    /* ---------------------------- text blocks --------------------------- */

    /**
     * Split admin-authored copy into blocks: a blank line starts a new
     * paragraph, and a line beginning with "- " becomes a bullet. Consecutive
     * bullet lines group into one list.
     *
     * @return list<array{type: 'paragraph'|'list', text?: string, items?: list<string>}>
     */
    public static function richText(?string $body): array
    {
        $blocks = array_filter(array_map('trim', preg_split('/\n\s*\n/', (string) $body) ?: []));
        $out = [];

        foreach ($blocks as $block) {
            $lines = array_map('trim', explode("\n", $block));
            $bullets = array_values(array_filter($lines, fn (string $l) => str_starts_with($l, '- ')));

            if (count($bullets) === count($lines) && $bullets !== []) {
                $out[] = [
                    'type' => 'list',
                    'items' => array_map(fn (string $l) => substr($l, 2), $bullets),
                ];

                continue;
            }

            $out[] = ['type' => 'paragraph', 'text' => $block];
        }

        return $out;
    }

    /** Blank-line-separated paragraphs — the plainer sibling of richText(). */
    public static function paragraphs(?string $body): array
    {
        return array_values(array_filter(
            array_map('trim', preg_split('/\n\s*\n/', (string) $body) ?: []),
        ));
    }
}
