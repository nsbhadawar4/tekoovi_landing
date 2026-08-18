@extends('layouts.app')

@php
    use App\Support\Sections;
    use App\Support\Site;

    $list = array_values($blogs);
    $featured = $list[0] ?? null;
    $rest = array_slice($list, 1);
@endphp

@section('content')
    <article class="relative">
        {{-- ambient hero backdrop --}}
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] overflow-hidden">
            <x-aurora class="opacity-40" />
            <x-grid-backdrop class="opacity-50" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_55%,var(--color-bg))]"></div>
        </div>

        <section class="relative pt-32 pb-8 md:pt-36 md:pb-12">
            <x-container class="text-center">
                <x-reveal>
                    <x-badge>Blog</x-badge>
                </x-reveal>
                <x-reveal :delay="0.06">
                    <h1 class="text-ink-gradient mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                        Insights from the studio
                    </h1>
                </x-reveal>
                <x-reveal :delay="0.12">
                    <p class="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">
                        Field notes on design, engineering and shipping AI products —
                        written by the people who build them.
                    </p>
                </x-reveal>
            </x-container>
        </section>

        <x-container class="pb-24 md:pb-32">
            @if (count($list) === 0)
                <div class="card-hairline mx-auto max-w-md rounded-2xl p-10 text-center">
                    <p class="font-display text-lg font-semibold text-ink">No posts yet</p>
                    <p class="mt-2 text-sm text-ink-2">New articles are on the way — check back soon.</p>
                </div>
            @else
                {{-- ---------------- featured (horizontal split) ---------------- --}}
                @if ($featured)
                    @php
                        $showAuthor = ! Sections::isHidden($featured, 'author');
                        $author = $featured['author'] ?: Site::NAME;
                    @endphp
                    <x-reveal class="mb-6 sm:mb-8">
                        <a
                            href="{{ Site::blogHref($featured) }}"
                            class="group relative grid overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0)_45%)] transition-[transform,border-color,box-shadow] duration-500 ease-out will-change-transform hover:-translate-y-1 hover:border-brand-2/40 hover:shadow-[0_40px_90px_-50px_rgba(108,59,255,0.6)] lg:grid-cols-2"
                        >
                            {{-- cover --}}
                            <div class="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[360px]">
                                @if (! empty($featured['coverImage']))
                                    <img
                                        src="{{ $featured['coverImage'] }}"
                                        alt="{{ $featured['title'] ?? '' }}"
                                        decoding="async"
                                        class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.06]"
                                    >
                                @else
                                    <x-blog-cover-fallback :title="$featured['title'] ?? ''" />
                                @endif
                                <div aria-hidden="true" class="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.14)_50%,transparent_70%)] transition-transform duration-[1100ms] ease-out group-hover:translate-x-full"></div>
                                <span class="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_6px_16px_-8px_rgba(108,59,255,0.9)]">
                                    Featured
                                </span>
                            </div>

                            {{-- content --}}
                            <div class="flex flex-col justify-center gap-4 p-7 sm:p-9 lg:p-10">
                                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
                                    @if (! empty($featured['category']))
                                        <span class="font-semibold uppercase tracking-[0.14em] text-brand-3">{{ $featured['category'] }}</span>
                                    @endif
                                    @if (! empty($featured['date']))
                                        <span class="inline-flex items-center gap-1.5">
                                            <x-icon name="CalendarDays" class="h-3.5 w-3.5" />
                                            {{ $featured['date'] }}
                                        </span>
                                    @endif
                                    @if (! empty($featured['readTime']))
                                        <span class="inline-flex items-center gap-1.5">
                                            <x-icon name="Clock" class="h-3.5 w-3.5" />
                                            {{ $featured['readTime'] }}
                                        </span>
                                    @endif
                                </div>

                                @if (! empty($featured['title']))
                                    <h2 class="text-ink-gradient text-balance font-display text-2xl font-semibold leading-[1.12] sm:text-3xl md:text-4xl">
                                        {{ $featured['title'] }}
                                    </h2>
                                @endif
                                @if (! empty($featured['excerpt']))
                                    <p class="line-clamp-3 text-[15px] leading-relaxed text-ink-2 md:text-base">{{ $featured['excerpt'] }}</p>
                                @endif

                                <div class="mt-2 flex items-center justify-between">
                                    @if ($showAuthor)
                                        <span class="inline-flex items-center gap-2.5">
                                            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-3 ring-1 ring-brand-2/30">
                                                {{ mb_strtoupper(mb_substr($author, 0, 1)) }}
                                            </span>
                                            <span class="text-sm font-medium text-ink-2">{{ $author }}</span>
                                        </span>
                                    @else
                                        <span></span>
                                    @endif
                                    <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
                                        Read article
                                        <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    </x-reveal>
                @endif

                @if (count($rest) > 0)
                    <div data-reveal-group data-stagger="0.07" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        @foreach ($rest as $blog)
                            <div data-reveal-item class="h-full">
                                <x-blog-card :blog="$blog" />
                            </div>
                        @endforeach
                    </div>
                @endif
            @endif
        </x-container>
    </article>
@endsection
