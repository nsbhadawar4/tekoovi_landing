<?php

use App\Support\Fonts;

/**
 * Content section registry — the single source of truth for the whole app.
 *
 * This is the port of `backend/types.ts` from the Next.js project. It used to
 * be split in two (TypeScript owned the admin UI, this file owned validation);
 * now that one Laravel app renders both, everything lives here:
 *
 *   kind        singleton (one object) or collection (a list of items)
 *   label       sidebar entry in /admin
 *   onPage      where the section shows on the site (sidebar sub-label)
 *   icon        Lucide name, resolved through config/lucide.php
 *   singular    noun for toasts, e.g. "Project added"
 *   titleField  collection only: which field is the row title
 *   subField    collection only: which field is the row subtitle
 *   header      collection only: a singleton record edited above the list
 *   blocks      landing-page blocks this section feeds (see page_blocks)
 *   noToggles   this section's fields get no show/hide switches
 *   fields      the editable fields, in the order the form renders them
 *
 * Field keys: name, label, type, placeholder, hint, group, default, aspect,
 * fit, outputWidth, options, noToggle.
 *
 * Types: text | textarea | number | boolean | icon | tags | select | image
 */

$legalHeaderFields = [
    ['name' => 'title', 'label' => 'Page title', 'type' => 'text'],
    ['name' => 'intro', 'label' => 'Intro paragraph', 'type' => 'textarea'],
    ['name' => 'updated', 'label' => 'Last updated', 'type' => 'text', 'placeholder' => '17 July 2026'],
];

$legalClauseFields = [
    ['name' => 'heading', 'label' => 'Clause heading', 'type' => 'text'],
    [
        'name' => 'body',
        'label' => 'Clause body — blank line = new paragraph, line starting with “- ” = bullet',
        'type' => 'textarea',
    ],
];

/*
|--------------------------------------------------------------------------
| Landing-page blocks
|--------------------------------------------------------------------------
|
| The landing page, block by block, in render order. This list IS the set of
| switches in the admin's "Page Sections" panel, and the home view renders each
| block only when its switch is on. A key with no stored value counts as shown,
| so a block added here later appears until someone deliberately turns it off.
|
*/
$pageBlocks = [
    ['key' => 'hero', 'label' => 'Hero', 'hint' => 'The opening banner, headline and buttons.'],
    ['key' => 'trustedBy', 'label' => 'Trusted By', 'hint' => 'The stats panel and the client logo marquee.'],
    ['key' => 'work', 'label' => 'Selected Work', 'hint' => 'The project card grid (“Products we’re proud to have shipped”).'],
    ['key' => 'services', 'label' => 'Services', 'hint' => 'The “What we do” cards.'],
    ['key' => 'industries', 'label' => 'Industries', 'hint' => 'The industry tiles.'],
    ['key' => 'why', 'label' => 'Why Tekoovi', 'hint' => 'The reasons-to-hire-us list.'],
    ['key' => 'process', 'label' => 'Process', 'hint' => 'The “How we work” timeline.'],
    ['key' => 'techStack', 'label' => 'Tech Stack', 'hint' => 'The technology marquee.'],
    ['key' => 'caseStudies', 'label' => 'Case Studies', 'hint' => 'The “Client success stories” cards.'],
    ['key' => 'testimonials', 'label' => 'Testimonials', 'hint' => 'The featured quote and the testimonial grid.'],
    ['key' => 'founder', 'label' => 'The Studio', 'hint' => 'The founder card, story, mission and vision.'],
    ['key' => 'blog', 'label' => 'Blog', 'hint' => 'The latest-posts teaser. /blog stays live.'],
    ['key' => 'faq', 'label' => 'FAQ', 'hint' => 'The question accordion.'],
];

/* One switch field per block — on by default, all inside a single card. */
$pageBlockFields = array_map(fn (array $block) => [
    'name' => $block['key'],
    'label' => $block['label'],
    'type' => 'boolean',
    'hint' => $block['hint'],
    'default' => true,
    'group' => 'pageBlocks',
], $pageBlocks);

return [

    'page_blocks' => $pageBlocks,

    /*
    |--------------------------------------------------------------------------
    | Sections
    |--------------------------------------------------------------------------
    */

    'sections' => [

        'settings' => [
            'kind' => 'singleton',
            'label' => 'Settings',
            'onPage' => 'Site-wide appearance',
            'icon' => 'SlidersHorizontal',
            'singular' => 'Settings',
            // Appearance controls for the whole site, not page content — nothing
            // here gets a show/hide switch.
            'noToggles' => true,
            'fields' => [
                [
                    'name' => 'logoImage',
                    'label' => 'Logo image',
                    'type' => 'image',
                    'aspect' => 3,
                    'fit' => 'contain',
                    'outputWidth' => 480,
                    'hint' => 'Wide lockup (3:1). The whole image stays visible — zoom out to fit it, spare space stays transparent.',
                ],
                [
                    'name' => 'fontFamily',
                    'label' => 'Font family',
                    'type' => 'select',
                    'options' => Fonts::options(),
                    'hint' => 'Applies to the whole landing page. Changes show on the next page refresh.',
                ],
                [
                    'name' => 'theme',
                    'label' => 'Default theme',
                    'type' => 'select',
                    'group' => 'theme',
                    'options' => [
                        ['value' => 'dark', 'label' => 'Dark'],
                        ['value' => 'light', 'label' => 'Light'],
                    ],
                    'hint' => 'The colour theme visitors see first. If the header toggle is on, their own choice is remembered afterwards.',
                ],
                [
                    'name' => 'showThemeToggle',
                    'label' => 'Show light/dark toggle in header',
                    'type' => 'boolean',
                    'group' => 'theme',
                    'default' => true,
                    'hint' => 'When on, visitors get a sun/moon button in the header to switch themes themselves.',
                ],
            ],
        ],

        'pageSections' => [
            'kind' => 'singleton',
            'label' => 'Page Sections',
            'onPage' => 'Whole landing page',
            'icon' => 'LayoutList',
            'singular' => 'Page sections',
            // These switches are the visibility controls themselves.
            'noToggles' => true,
            'fields' => $pageBlockFields,
        ],

        'hero' => [
            'kind' => 'singleton',
            'label' => 'Hero',
            'onPage' => 'Top of page',
            'icon' => 'Sparkles',
            'singular' => 'Hero',
            'blocks' => ['hero'],
            'fields' => [
                ['name' => 'backgroundImage', 'label' => 'Background banner image', 'type' => 'image', 'aspect' => 16 / 9, 'outputWidth' => 1920],
                ['name' => 'badge', 'label' => 'Badge text', 'type' => 'text'],
                ['name' => 'titleLead', 'label' => 'Headline — lead', 'type' => 'text'],
                ['name' => 'titleHighlight', 'label' => 'Headline — highlight', 'type' => 'text'],
                ['name' => 'subtitle', 'label' => 'Subtitle', 'type' => 'textarea'],
                ['name' => 'primaryLabel', 'label' => 'Primary button label', 'type' => 'text', 'hint' => 'Switching the label or the link off removes the button.'],
                ['name' => 'primaryHref', 'label' => 'Primary button link', 'type' => 'text'],
                ['name' => 'secondaryLabel', 'label' => 'Secondary button label', 'type' => 'text', 'hint' => 'Switching the label or the link off removes the button.'],
                ['name' => 'secondaryHref', 'label' => 'Secondary button link', 'type' => 'text'],
            ],
        ],

        'stats' => [
            'kind' => 'collection',
            'label' => 'Stats',
            'onPage' => 'Trusted By',
            'icon' => 'BarChart3',
            'singular' => 'Stat',
            'blocks' => ['trustedBy'],
            'titleField' => 'label',
            'subField' => 'value',
            'fields' => [
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
                ['name' => 'value', 'label' => 'Value (number)', 'type' => 'number'],
                ['name' => 'suffix', 'label' => 'Suffix', 'type' => 'text', 'placeholder' => '+  %  etc.'],
            ],
        ],

        'logos' => [
            'kind' => 'collection',
            'label' => 'Client Logos',
            'onPage' => 'Trusted By marquee',
            'icon' => 'Building2',
            'singular' => 'Logo',
            'blocks' => ['trustedBy'],
            'titleField' => 'name',
            'fields' => [
                ['name' => 'name', 'label' => 'Company name', 'type' => 'text'],
            ],
        ],

        'projects' => [
            'kind' => 'collection',
            'label' => 'Projects',
            'onPage' => 'Selected Work',
            'icon' => 'FolderKanban',
            'singular' => 'Project',
            'blocks' => ['work', 'caseStudies'],
            'titleField' => 'name',
            'subField' => 'category',
            'fields' => [
                ['name' => 'image', 'label' => 'Card image', 'type' => 'image'],
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'category', 'label' => 'Category', 'type' => 'text'],
                ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
                ['name' => 'tech', 'label' => 'Tech (comma separated)', 'type' => 'tags'],
                ['name' => 'country', 'label' => 'Country', 'type' => 'text'],
                ['name' => 'result', 'label' => 'Result badge', 'type' => 'text'],
                [
                    'name' => 'accent',
                    'label' => 'Accent (Tailwind gradient classes)',
                    'type' => 'text',
                    'placeholder' => 'from-[#6C3BFF]/40 to-[#3a1f8f]/10',
                    'hint' => 'Only used as the card background when there’s no image.',
                ],
                [
                    'name' => 'year',
                    'label' => 'Year',
                    'type' => 'text',
                    'placeholder' => '2025',
                    'hint' => 'Everything below shows on the case study page only.',
                ],
                ['name' => 'duration', 'label' => 'Engagement length', 'type' => 'text', 'placeholder' => '14 weeks'],
                ['name' => 'services', 'label' => 'Services (comma separated)', 'type' => 'tags'],
                [
                    'name' => 'gallery1',
                    'label' => 'Gallery image 1',
                    'type' => 'image',
                    'aspect' => 16 / 10,
                    'outputWidth' => 1600,
                    'hint' => 'Optional screenshots shown further down the case study page.',
                ],
                ['name' => 'gallery2', 'label' => 'Gallery image 2', 'type' => 'image', 'aspect' => 16 / 10, 'outputWidth' => 1600],
                ['name' => 'gallery3', 'label' => 'Gallery image 3', 'type' => 'image', 'aspect' => 16 / 10, 'outputWidth' => 1600],
                ['name' => 'overview', 'label' => 'Overview', 'type' => 'textarea'],
                ['name' => 'challenge', 'label' => 'The challenge', 'type' => 'textarea'],
                ['name' => 'solution', 'label' => 'What we built', 'type' => 'textarea'],
                ['name' => 'outcome', 'label' => 'The outcome', 'type' => 'textarea'],
                [
                    'name' => 'highlights',
                    'label' => 'Result highlights (comma separated)',
                    'type' => 'tags',
                    'placeholder' => '63% faster triage, 4.9 App Store rating',
                ],
                ['name' => 'quote', 'label' => 'Client quote', 'type' => 'textarea'],
                ['name' => 'quoteAuthor', 'label' => 'Quote author', 'type' => 'text', 'placeholder' => 'Sara Whitfield, COO'],
            ],
        ],

        'services' => [
            'kind' => 'collection',
            'label' => 'Services',
            'onPage' => 'What we do',
            'icon' => 'Wrench',
            'singular' => 'Service',
            'blocks' => ['services'],
            'titleField' => 'title',
            'subField' => 'description',
            'fields' => [
                ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
                ['name' => 'icon', 'label' => 'Icon', 'type' => 'icon'],
                ['name' => 'featured', 'label' => 'Highlight this service', 'type' => 'boolean'],
            ],
        ],

        'industries' => [
            'kind' => 'collection',
            'label' => 'Industries',
            'onPage' => 'Industries',
            'icon' => 'Factory',
            'singular' => 'Industry',
            'blocks' => ['industries'],
            'titleField' => 'name',
            'fields' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'icon', 'label' => 'Icon', 'type' => 'icon'],
            ],
        ],

        'why' => [
            'kind' => 'collection',
            'label' => 'Why Tekoovi',
            'onPage' => 'Why Tekoovi',
            'icon' => 'BadgeCheck',
            'singular' => 'Reason',
            'blocks' => ['why'],
            'titleField' => 'title',
            'subField' => 'description',
            'fields' => [
                ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
                ['name' => 'icon', 'label' => 'Icon', 'type' => 'icon'],
            ],
        ],

        'process' => [
            'kind' => 'collection',
            'label' => 'Process',
            'onPage' => 'How we work',
            'icon' => 'Workflow',
            'singular' => 'Step',
            'blocks' => ['process'],
            'titleField' => 'title',
            'subField' => 'description',
            'fields' => [
                ['name' => 'step', 'label' => 'Step number', 'type' => 'text', 'placeholder' => '01'],
                ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
            ],
        ],

        'techStack' => [
            'kind' => 'collection',
            'label' => 'Tech Stack',
            'onPage' => 'Technology',
            'icon' => 'Code2',
            'singular' => 'Technology',
            'blocks' => ['techStack'],
            'titleField' => 'name',
            'fields' => [
                ['name' => 'name', 'label' => 'Technology name', 'type' => 'text'],
            ],
        ],

        'caseStudy' => [
            'kind' => 'singleton',
            'label' => 'Case Study',
            'onPage' => 'Case Study',
            'icon' => 'FileText',
            'singular' => 'Case study',
            'fields' => [
                ['name' => 'client', 'label' => 'Client', 'type' => 'text'],
                ['name' => 'title', 'label' => 'Title', 'type' => 'textarea'],
                ['name' => 'problem', 'label' => 'Problem', 'type' => 'textarea'],
                ['name' => 'research', 'label' => 'Research', 'type' => 'textarea'],
                ['name' => 'solution', 'label' => 'Solution', 'type' => 'textarea'],
                ['name' => 'challenges', 'label' => 'Challenges', 'type' => 'textarea'],
                ['name' => 'tech', 'label' => 'Tech (comma separated)', 'type' => 'tags'],
                ['name' => 'outcome', 'label' => 'Outcome statement', 'type' => 'textarea'],
            ],
        ],

        'caseMetrics' => [
            'kind' => 'collection',
            'label' => 'Case Metrics',
            'onPage' => 'Case Study — metrics',
            'icon' => 'TrendingUp',
            'singular' => 'Metric',
            'titleField' => 'value',
            'subField' => 'label',
            'fields' => [
                ['name' => 'value', 'label' => 'Value', 'type' => 'text', 'placeholder' => '63%'],
                ['name' => 'label', 'label' => 'Label', 'type' => 'text'],
            ],
        ],

        'testimonials' => [
            'kind' => 'collection',
            'label' => 'Testimonials',
            'onPage' => 'Testimonials',
            'icon' => 'MessageSquareQuote',
            'singular' => 'Testimonial',
            'blocks' => ['testimonials'],
            'titleField' => 'name',
            'subField' => 'role',
            'fields' => [
                ['name' => 'quote', 'label' => 'Quote', 'type' => 'textarea'],
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'role', 'label' => 'Role', 'type' => 'text'],
                ['name' => 'initials', 'label' => 'Initials', 'type' => 'text', 'placeholder' => 'SW'],
            ],
        ],

        'founder' => [
            'kind' => 'singleton',
            'label' => 'Founder',
            'onPage' => 'The Studio',
            'icon' => 'UserRound',
            'singular' => 'Founder',
            'blocks' => ['founder'],
            'fields' => [
                ['name' => 'name', 'label' => 'Name', 'type' => 'text'],
                ['name' => 'role', 'label' => 'Role', 'type' => 'text'],
                ['name' => 'initials', 'label' => 'Initials', 'type' => 'text', 'placeholder' => 'AP'],
                ['name' => 'story', 'label' => 'Story', 'type' => 'textarea'],
                ['name' => 'mission', 'label' => 'Mission', 'type' => 'textarea'],
                ['name' => 'vision', 'label' => 'Vision', 'type' => 'textarea'],
            ],
        ],

        'faqs' => [
            'kind' => 'collection',
            'label' => 'FAQ',
            'onPage' => 'FAQ',
            'icon' => 'HelpCircle',
            'singular' => 'FAQ',
            'blocks' => ['faq'],
            'titleField' => 'q',
            'subField' => 'a',
            'fields' => [
                ['name' => 'q', 'label' => 'Question', 'type' => 'text'],
                ['name' => 'a', 'label' => 'Answer', 'type' => 'textarea'],
            ],
        ],

        'contact' => [
            'kind' => 'singleton',
            'label' => 'Contact',
            'onPage' => 'Footer, legal pages + every Book a call button',
            'icon' => 'Mail',
            'singular' => 'Contact',
            'fields' => [
                ['name' => 'email', 'label' => 'Email', 'type' => 'text'],
                ['name' => 'whatsapp', 'label' => 'WhatsApp link', 'type' => 'text'],
                [
                    'name' => 'calendly',
                    'label' => 'Calendly link — every “Book a call” button opens this',
                    'type' => 'text',
                    'hint' => 'Switching this off removes every “Book a call” button on the site.',
                ],
            ],
        ],

        'socials' => [
            'kind' => 'collection',
            'label' => 'Socials',
            'onPage' => 'Footer + founder',
            'icon' => 'Share2',
            'singular' => 'Social link',
            'titleField' => 'label',
            'subField' => 'href',
            'fields' => [
                [
                    'name' => 'label',
                    'label' => 'Label',
                    'type' => 'text',
                    'placeholder' => 'LinkedIn',
                    'hint' => 'Switching the label or the URL off removes this link from the footer and founder card.',
                ],
                ['name' => 'href', 'label' => 'URL', 'type' => 'text'],
            ],
        ],

        // Legal pages: a header singleton plus a list of clauses.
        'privacy' => [
            'kind' => 'singleton',
            'label' => 'Privacy header',
            'onPage' => '/privacy',
            'icon' => 'ShieldCheck',
            'singular' => 'Privacy header',
            'hidden' => true, // edited through privacyClauses, not its own sidebar entry
            'fields' => $legalHeaderFields,
        ],

        'privacyClauses' => [
            'kind' => 'collection',
            'label' => 'Privacy Policy',
            'onPage' => '/privacy',
            'icon' => 'ShieldCheck',
            'singular' => 'Privacy clause',
            'titleField' => 'heading',
            'subField' => 'body',
            'header' => ['key' => 'privacy', 'label' => 'Page header'],
            'fields' => $legalClauseFields,
        ],

        'terms' => [
            'kind' => 'singleton',
            'label' => 'Terms header',
            'onPage' => '/terms',
            'icon' => 'Scale',
            'singular' => 'Terms header',
            'hidden' => true,
            'fields' => $legalHeaderFields,
        ],

        'termsClauses' => [
            'kind' => 'collection',
            'label' => 'Terms of Service',
            'onPage' => '/terms',
            'icon' => 'Scale',
            'singular' => 'Terms clause',
            'titleField' => 'heading',
            'subField' => 'body',
            'header' => ['key' => 'terms', 'label' => 'Page header'],
            'fields' => $legalClauseFields,
        ],

        'blogs' => [
            'kind' => 'collection',
            'label' => 'Blog',
            'onPage' => '/blog',
            'icon' => 'Newspaper',
            'singular' => 'Blog post',
            'blocks' => ['blog'],
            'titleField' => 'title',
            'subField' => 'category',
            'fields' => [
                [
                    'name' => 'coverImage',
                    'label' => 'Cover image',
                    'type' => 'image',
                    'aspect' => 16 / 9,
                    'outputWidth' => 1600,
                    'hint' => 'Shown on the blog card and first in the detail-page slider.',
                ],
                ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
                ['name' => 'category', 'label' => 'Category', 'type' => 'text', 'placeholder' => 'Engineering'],
                [
                    'name' => 'excerpt',
                    'label' => 'Excerpt / summary',
                    'type' => 'textarea',
                    'hint' => 'One or two lines shown on the blog card.',
                ],
                ['name' => 'author', 'label' => 'Author', 'type' => 'text', 'placeholder' => 'Tekoovi Team'],
                ['name' => 'date', 'label' => 'Date', 'type' => 'text', 'placeholder' => '23 July 2026'],
                ['name' => 'readTime', 'label' => 'Read time', 'type' => 'text', 'placeholder' => '5 min read'],
                ['name' => 'tags', 'label' => 'Tags (comma separated)', 'type' => 'tags'],
                ['name' => 'content', 'label' => 'Body — blank line = new paragraph', 'type' => 'textarea'],
                [
                    'name' => 'image1',
                    'label' => 'Slider image 1',
                    'type' => 'image',
                    'aspect' => 16 / 9,
                    'outputWidth' => 1600,
                    'hint' => 'The cover + these appear in the detail-page image slider.',
                ],
                ['name' => 'image2', 'label' => 'Slider image 2', 'type' => 'image', 'aspect' => 16 / 9, 'outputWidth' => 1600],
                ['name' => 'image3', 'label' => 'Slider image 3', 'type' => 'image', 'aspect' => 16 / 9, 'outputWidth' => 1600],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Field visibility
    |--------------------------------------------------------------------------
    |
    | Records carry a list of field names the admin switched off. Reads for the
    | public site blank those values out; the stored value is left alone so
    | switching a field back on restores it.
    |
    */

    'hidden_fields_key' => 'hiddenFields',

    /*
    |--------------------------------------------------------------------------
    | Fields that never get a switch
    |--------------------------------------------------------------------------
    |
    | A boolean field is already its own on/off control, so hiding it would only
    | duplicate what turning it off does.
    |
    */

    'non_toggleable_types' => ['boolean'],
];
