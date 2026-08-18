@props([
    'calendly' => '',
    'logoImage' => null,
    'showThemeToggle' => false,
    'links' => [],
])

@php
    use App\Support\Site;

    // The section anchors only exist on the landing page. Everywhere else the
    // same links have to navigate home first.
    $isHome = request()->path() === '/';
    $hrefFor = fn (string $href) => str_starts_with($href, '#')
        ? ($isHome ? $href : '/'.$href)
        : $href;

    // With the hero switched off there is no #home anchor to jump to, so the
    // logo goes to the top of the site instead of a link that does nothing.
    $hasHome = collect($links)->contains(fn ($l) => $l['href'] === '#home');
    $homeHref = $hasHome ? $hrefFor('#home') : '/';

    // On the landing page the scroll spy owns the active state; elsewhere the
    // matching route link is active instead.
    $path = '/'.ltrim(request()->path(), '/');
    $activeHref = $isHome
        ? '#home'
        : (collect($links)->first(fn ($l) => ! str_starts_with($l['href'], '#')
            && ($path === $l['href'] || str_starts_with($path, $l['href'].'/')))['href'] ?? '');
@endphp

<header
    data-navbar
    data-active-href="{{ $activeHref }}"
    @if ($isHome) data-spy="1" @endif
    class="site-header fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-0 min-[390px]:px-4"
>
    <nav class="relative w-full max-w-7xl">
        {{-- Ambient brand glow that fades in once the page is scrolled --}}
        <div data-nav-glow aria-hidden="true" class="pointer-events-none absolute -inset-x-16 -bottom-10 -top-6 -z-10 opacity-0 transition-opacity duration-700">
            <div class="mx-auto h-full w-2/3 rounded-full bg-brand/12 blur-3xl"></div>
        </div>

        {{-- Gradient hairline ring --}}
        <div data-nav-ring class="rounded-full bg-[linear-gradient(120deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.08))] transition-all duration-500">
            <div data-nav-shell class="relative flex items-center justify-between gap-2 rounded-full bg-bg-2/45 px-2 py-2 backdrop-blur-xl transition-colors duration-500 min-[390px]:gap-3 min-[390px]:px-2.5 sm:px-3">
                {{-- Top sheen --}}
                <div aria-hidden="true" class="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"></div>

                <a href="{{ $homeHref }}" aria-label="{{ Site::NAME }} home" class="group relative pl-1">
                    <x-logo :logo-image="$logoImage" class="transition-transform duration-300 group-hover:scale-[1.03]" />
                </a>

                <ul class="relative hidden items-center gap-0.5 md:flex">
                    {{-- One pill and one dot slide between links, which is what
                         motion's shared `layoutId` produced. --}}
                    <span data-nav-indicator aria-hidden="true" class="nav-indicator pointer-events-none absolute left-0 top-0 -z-10 h-full rounded-full bg-white/[0.08] opacity-0 ring-1 ring-inset ring-white/10"></span>
                    <span data-nav-dot aria-hidden="true" class="nav-dot pointer-events-none absolute -bottom-0.5 left-0 h-1 w-1 rounded-full bg-brand-3 opacity-0 shadow-[0_0_8px_2px_rgba(179,136,255,0.7)]"></span>

                    @foreach ($links as $link)
                        <li class="relative">
                            <a
                                href="{{ $hrefFor($link['href']) }}"
                                data-nav-link="{{ $link['href'] }}"
                                class="relative block rounded-full px-4 py-2 text-sm font-medium text-ink-2 transition-colors duration-300 hover:text-ink"
                            >
                                <span class="relative">{{ $link['label'] }}</span>
                            </a>
                        </li>
                    @endforeach
                </ul>

                <div class="flex items-center gap-2">
                    @if ($showThemeToggle)
                        <x-theme-toggle />
                    @endif

                    {{-- No Calendly link (or it's switched off in the admin) — then
                         there is nothing for this button to open. --}}
                    @if ($calendly)
                        <div class="hidden md:block">
                            <x-button :href="$calendly" size="md" magnetic with-arrow>Book a call</x-button>
                        </div>
                    @endif

                    <button
                        type="button"
                        data-nav-toggle
                        aria-label="Toggle menu"
                        aria-expanded="false"
                        class="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-ink transition-colors hover:bg-white/[0.08] md:hidden"
                    >
                        <span data-burger class="relative block h-3.5 w-[18px]">
                            <span class="absolute left-0 top-0 block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 [.is-open>&]:translate-y-1.5 [.is-open>&]:rotate-45"></span>
                            <span class="absolute left-0 top-1.5 block h-0.5 w-full rounded-full bg-current transition-all duration-200 [.is-open>&]:translate-x-2 [.is-open>&]:opacity-0"></span>
                            <span class="absolute bottom-0 left-0 block h-0.5 w-full origin-center rounded-full bg-current transition-transform duration-300 [.is-open>&]:-translate-y-1.5 [.is-open>&]:-rotate-45"></span>
                        </span>
                    </button>
                </div>

                {{-- Reading progress --}}
                <div data-nav-progress aria-hidden="true" class="pointer-events-none absolute inset-x-[16%] bottom-0 h-px origin-left rounded-full bg-gradient-to-r from-brand via-brand-3 to-transparent opacity-0 transition-opacity duration-500" style="transform: scaleX(0)"></div>
            </div>
        </div>

        {{-- Mobile sheet --}}
        <button
            type="button"
            data-nav-scrim
            aria-label="Close menu"
            tabindex="-1"
            class="fixed inset-0 -z-10 hidden cursor-default bg-bg/70 backdrop-blur-sm md:hidden"
        ></button>

        <div data-nav-sheet data-pop class="absolute inset-x-0 top-full mt-2 hidden origin-top md:hidden">
            <div class="rounded-[28px] bg-[linear-gradient(140deg,rgba(255,255,255,0.16),rgba(138,92,255,0.22),rgba(255,255,255,0.06))] p-px shadow-[0_28px_70px_-20px_rgba(0,0,0,0.95)]">
                <div class="rounded-[27px] bg-bg-2/95 p-3 backdrop-blur-2xl">
                    <ul class="flex flex-col gap-1">
                        @foreach ($links as $link)
                            <li>
                                <a
                                    href="{{ $hrefFor($link['href']) }}"
                                    class="flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium text-ink-2 transition-colors hover:bg-white/[0.04] hover:text-ink"
                                >{{ $link['label'] }}</a>
                            </li>
                        @endforeach

                        @if ($calendly)
                            <li class="mt-2 px-1 pb-1">
                                <x-button :href="$calendly" size="lg" with-arrow class="w-full">Book a call</x-button>
                            </li>
                        @endif
                    </ul>
                </div>
            </div>
        </div>
    </nav>
</header>
