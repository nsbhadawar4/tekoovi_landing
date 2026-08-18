@php
    use App\Support\Fonts;
    use App\Support\Site;

    $settings = $content['settings'] ?? [];
    $contact = $content['contact'] ?? [];
    $pageSections = $content['pageSections'] ?? [];

    // Admin-selectable site font. The default keeps the designed Inter/Jakarta
    // look untouched; any other choice overrides both the body and heading font
    // variables for the whole site, so the change is visible everywhere.
    $font = Fonts::resolve($settings['fontFamily'] ?? null);
    $applyFont = Fonts::isCustom($settings['fontFamily'] ?? null);

    // Admin-selectable default theme + whether visitors get a header toggle.
    $defaultTheme = ($settings['theme'] ?? 'dark') === 'light' ? 'light' : 'dark';
    $showThemeToggle = ($settings['showThemeToggle'] ?? true) !== false;

    $meta = $meta ?? [];
    $title = $meta['title'] ?? (Site::NAME.' — '.Site::TAGLINE);
    $description = $meta['description'] ?? Site::DESCRIPTION;

    $orgSchema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => Site::NAME,
        'url' => Site::URL,
        'description' => Site::DESCRIPTION,
        'slogan' => Site::TAGLINE,
        'areaServed' => 'Worldwide',
        'knowsAbout' => [
            'Web Development', 'SaaS Platforms', 'Artificial Intelligence',
            'Mobile Applications', 'Automation', 'UI/UX Design',
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#08090F">

    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <meta name="application-name" content="{{ Site::NAME }}">
    <meta name="author" content="{{ Site::NAME }}">
    <meta name="keywords" content="digital product studio, SaaS development, AI solutions, custom web development, mobile app development, product design agency, startup product studio">
    @isset($meta['canonical'])
        <link rel="canonical" href="{{ $meta['canonical'] }}">
    @endisset
    @if ($meta['noindex'] ?? false)
        <meta name="robots" content="noindex, nofollow">
    @else
        <meta name="robots" content="index, follow, max-image-preview:large">
    @endif

    <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
    <meta property="og:site_name" content="{{ Site::NAME }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:locale" content="en_US">
    @isset($meta['canonical'])
        <meta property="og:url" content="{{ $meta['canonical'] }}">
    @endisset
    @if (! empty($meta['image']))
        <meta property="og:image" content="{{ url($meta['image']) }}">
    @endif

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:creator" content="@tekoovi">

    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    <link rel="icon" href="{{ asset('icon.svg') }}" type="image/svg+xml">

    {{-- The design fonts. Next.js self-hosted these through next/font; the CSS
         variables they fill are identical, so every token still resolves. --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
    @if ($applyFont && $font['href'])
        <link rel="stylesheet" href="{{ $font['href'] }}">
    @endif

    {{-- No-flash theme: applied on <html> before the page below paints. --}}
    <script>
        (function () {
            try {
                var d = @json($defaultTheme), t = d;
                @if ($showThemeToggle)
                    var s = localStorage.getItem(@json(Site::THEME_STORAGE_KEY));
                    if (s === "light" || s === "dark") t = s;
                @endif
                var r = document.documentElement;
                r.setAttribute("data-theme", t);
                r.style.colorScheme = t;
            } catch (e) {}
        })();
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body
    class="min-h-screen antialiased"
    @if ($applyFont)
        style="font-family: {{ $font['stack'] }}; --font-sans: {{ $font['stack'] }}; --font-display: {{ $font['stack'] }}"
    @endif
>
    {{-- Intro curtain, shown once per browsing session. --}}
    <div data-preloader class="preloader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
        <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]"></div>
        <div class="preloader-mark relative scale-125">
            <x-logo :logo-image="$settings['logoImage'] ?? null" />
        </div>
        <div class="relative mt-8 h-px w-40 overflow-hidden rounded-full bg-white/10">
            <div class="preloader-bar h-full bg-linear-to-r from-brand-2 to-brand-3"></div>
        </div>
    </div>

    <span class="grain" aria-hidden="true"></span>

    <x-navbar
        :calendly="$contact['calendly'] ?? ''"
        :logo-image="$settings['logoImage'] ?? null"
        :show-theme-toggle="$showThemeToggle"
        :links="Site::visibleNavLinks($pageSections)"
    />

    <main>
        @yield('content')
    </main>

    {{-- Closing conversion panel — shows on every page that has somewhere to
         send people; both halves come from the admin Contact section. --}}
    <x-cta-band :calendly="$contact['calendly'] ?? ''" :email="$contact['email'] ?? ''" />

    <x-footer
        :contact="$contact"
        :socials="$content['socials'] ?? []"
        :services="$content['services'] ?? []"
        :logo-image="$settings['logoImage'] ?? null"
        :page-sections="$pageSections"
    />

    {{-- Mobile-only booking bar: phones lose the header CTA the moment you
         scroll, which is exactly when intent is highest. --}}
    @if (! empty($contact['calendly']))
        <div data-sticky-cta data-slide-in class="fixed inset-x-3 bottom-3 z-40 md:hidden">
            <div class="glass flex items-center gap-3 rounded-2xl p-2.5 pl-4 shadow-[var(--shadow-e3)]">
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-ink">Ready to start?</p>
                    <p class="truncate text-xs text-ink-3">Free 30-min strategy call</p>
                </div>
                <a
                    href="{{ $contact['calendly'] }}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn-brand inline-flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white"
                >
                    <x-icon name="CalendarCheck" class="h-4 w-4" />
                    Book a call
                </a>
                <button type="button" data-sticky-dismiss aria-label="Dismiss" class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:text-ink">
                    <x-icon name="X" class="h-4 w-4" />
                </button>
            </div>
        </div>
    @endif

    {{-- Desktop scroll-to-top button ringed by the page's reading progress. --}}
    <button
        type="button"
        data-back-to-top
        data-fade-in
        aria-label="Back to top"
        class="group fixed bottom-6 right-6 z-40 hidden h-12 w-12 place-items-center rounded-full md:grid"
    >
        <span class="glass absolute inset-0 rounded-full transition-colors duration-300 group-hover:border-brand-2/40"></span>
        <svg aria-hidden="true" viewBox="0 0 100 100" class="absolute inset-0 -rotate-90">
            <circle
                data-progress-ring
                cx="50" cy="50" r="46"
                fill="none"
                stroke="var(--color-brand-2)"
                stroke-width="3"
                stroke-linecap="round"
                pathLength="1"
                stroke-dasharray="1"
                stroke-dashoffset="1"
            />
        </svg>
        <x-icon name="ArrowUp" class="relative h-4.5 w-4.5 text-ink-2 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-ink" />
    </button>

    <script type="application/ld+json">@json($orgSchema, JSON_UNESCAPED_SLASHES)</script>
</body>
</html>
