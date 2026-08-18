<?php

/**
 * Content section registry.
 *
 * This mirrors `backend/types.ts` in the Next.js app, which stays the source of
 * truth for the *admin UI* (labels, hints, placeholders, ordering). The API only
 * needs three things per section, so only those are duplicated here:
 *
 *   kind      singleton (one object) or collection (a list of items)
 *   fields    field name => type, used to validate and coerce incoming values
 *   noToggles the section's fields cannot be hidden from the site
 *
 * Keep this file in step with SECTIONS in backend/types.ts: a field missing here
 * is silently dropped on save, exactly as an unknown field was before.
 *
 * Types: text | textarea | number | boolean | icon | tags | select | image
 */
$legalHeaderFields = [
    'title' => 'text',
    'intro' => 'textarea',
    'updated' => 'text',
];

$legalClauseFields = [
    'heading' => 'text',
    'body' => 'textarea',
];

return [

    /*
    |--------------------------------------------------------------------------
    | Sections
    |--------------------------------------------------------------------------
    */

    'sections' => [

        'settings' => [
            'kind' => 'singleton',
            'noToggles' => true,
            'fields' => [
                'logoImage' => 'image',
                'fontFamily' => 'select',
                'theme' => 'select',
                'showThemeToggle' => 'boolean',
            ],
        ],

        'pageSections' => [
            'kind' => 'singleton',
            'noToggles' => true,
            'fields' => [
                'hero' => 'boolean',
                'trustedBy' => 'boolean',
                'work' => 'boolean',
                'services' => 'boolean',
                'industries' => 'boolean',
                'why' => 'boolean',
                'process' => 'boolean',
                'techStack' => 'boolean',
                'caseStudies' => 'boolean',
                'testimonials' => 'boolean',
                'founder' => 'boolean',
                'blog' => 'boolean',
                'faq' => 'boolean',
            ],
        ],

        'hero' => [
            'kind' => 'singleton',
            'fields' => [
                'backgroundImage' => 'image',
                'badge' => 'text',
                'titleLead' => 'text',
                'titleHighlight' => 'text',
                'subtitle' => 'textarea',
                'primaryLabel' => 'text',
                'primaryHref' => 'text',
                'secondaryLabel' => 'text',
                'secondaryHref' => 'text',
            ],
        ],

        'stats' => [
            'kind' => 'collection',
            'fields' => [
                'label' => 'text',
                'value' => 'number',
                'suffix' => 'text',
            ],
        ],

        'logos' => [
            'kind' => 'collection',
            'fields' => [
                'name' => 'text',
            ],
        ],

        'projects' => [
            'kind' => 'collection',
            'fields' => [
                'image' => 'image',
                'name' => 'text',
                'category' => 'text',
                'description' => 'textarea',
                'tech' => 'tags',
                'country' => 'text',
                'result' => 'text',
                'accent' => 'text',
                'year' => 'text',
                'duration' => 'text',
                'services' => 'tags',
                'gallery1' => 'image',
                'gallery2' => 'image',
                'gallery3' => 'image',
                'overview' => 'textarea',
                'challenge' => 'textarea',
                'solution' => 'textarea',
                'outcome' => 'textarea',
                'highlights' => 'tags',
                'quote' => 'textarea',
                'quoteAuthor' => 'text',
            ],
        ],

        'services' => [
            'kind' => 'collection',
            'fields' => [
                'title' => 'text',
                'description' => 'textarea',
                'icon' => 'icon',
                'featured' => 'boolean',
            ],
        ],

        'industries' => [
            'kind' => 'collection',
            'fields' => [
                'name' => 'text',
                'icon' => 'icon',
            ],
        ],

        'why' => [
            'kind' => 'collection',
            'fields' => [
                'title' => 'text',
                'description' => 'textarea',
                'icon' => 'icon',
            ],
        ],

        'process' => [
            'kind' => 'collection',
            'fields' => [
                'step' => 'text',
                'title' => 'text',
                'description' => 'textarea',
            ],
        ],

        'techStack' => [
            'kind' => 'collection',
            'fields' => [
                'name' => 'text',
            ],
        ],

        'caseStudy' => [
            'kind' => 'singleton',
            'fields' => [
                'client' => 'text',
                'title' => 'textarea',
                'problem' => 'textarea',
                'research' => 'textarea',
                'solution' => 'textarea',
                'challenges' => 'textarea',
                'tech' => 'tags',
                'outcome' => 'textarea',
            ],
        ],

        'caseMetrics' => [
            'kind' => 'collection',
            'fields' => [
                'value' => 'text',
                'label' => 'text',
            ],
        ],

        'testimonials' => [
            'kind' => 'collection',
            'fields' => [
                'quote' => 'textarea',
                'name' => 'text',
                'role' => 'text',
                'initials' => 'text',
            ],
        ],

        'founder' => [
            'kind' => 'singleton',
            'fields' => [
                'name' => 'text',
                'role' => 'text',
                'initials' => 'text',
                'story' => 'textarea',
                'mission' => 'textarea',
                'vision' => 'textarea',
            ],
        ],

        'faqs' => [
            'kind' => 'collection',
            'fields' => [
                'q' => 'text',
                'a' => 'textarea',
            ],
        ],

        'contact' => [
            'kind' => 'singleton',
            'fields' => [
                'email' => 'text',
                'whatsapp' => 'text',
                'calendly' => 'text',
            ],
        ],

        'socials' => [
            'kind' => 'collection',
            'fields' => [
                'label' => 'text',
                'href' => 'text',
            ],
        ],

        // Legal pages: a header singleton plus a list of clauses.
        'privacy' => [
            'kind' => 'singleton',
            'fields' => $legalHeaderFields,
        ],

        'privacyClauses' => [
            'kind' => 'collection',
            'fields' => $legalClauseFields,
        ],

        'terms' => [
            'kind' => 'singleton',
            'fields' => $legalHeaderFields,
        ],

        'termsClauses' => [
            'kind' => 'collection',
            'fields' => $legalClauseFields,
        ],

        'blogs' => [
            'kind' => 'collection',
            'fields' => [
                'coverImage' => 'image',
                'title' => 'text',
                'category' => 'text',
                'excerpt' => 'textarea',
                'author' => 'text',
                'date' => 'text',
                'readTime' => 'text',
                'tags' => 'tags',
                'content' => 'textarea',
                'image1' => 'image',
                'image2' => 'image',
                'image3' => 'image',
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
