@extends('layouts.app')

@php
    use App\Support\Sections;
    use App\Support\Site;

    $images = Site::blogImages($blog);
    $tags = array_filter($blog['tags'] ?? []);
    // "Tekoovi" stands in for a blank author, so the switched-off case is read
    // off the record itself.
    $showAuthor = ! Sections::isHidden($blog, 'author');
    $author = $blog['author'] ?: Site::NAME;
    $paragraphs = Site::paragraphs($blog['content'] ?? '');
    $calendly = $content['contact']['calendly'] ?? '';
@endphp

@section('content')
    <article class="relative">
        {{-- ambient backdrop --}}
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden">
            <x-aurora class="opacity-35" />
            <x-grid-backdrop class="opacity-50" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,var(--color-bg))]"></div>
        </div>

        {{-- ===================== header ===================== --}}
        <section class="relative pt-28 pb-8 md:pt-32">
            <x-container class="max-w-3xl">
                <x-reveal>
                    <a href="{{ Site::BLOG_BASE }}" class="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink">
                        <span class="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                            <x-icon name="ArrowLeft" class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        </span>
                        Back to blog
                    </a>
                </x-reveal>

                <x-reveal :delay="0.06">
                    <div class="mt-8">
                        @if (! empty($blog['category']))
                            <x-badge>{{ $blog['category'] }}</x-badge>
                        @endif
                        @if (! empty($blog['title']))
                            <h1 class="text-ink-gradient mt-5 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
                                {{ $blog['title'] }}
                            </h1>
                        @endif

                        @if ($showAuthor || ! empty($blog['date']) || ! empty($blog['readTime']))
                            <div class="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-white/10 py-5">
                                @if ($showAuthor)
                                    <span class="inline-flex items-center gap-3">
                                        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 font-display text-sm font-bold text-brand-3 ring-1 ring-brand-2/30">
                                            {{ mb_strtoupper(mb_substr($author, 0, 1)) }}
                                        </span>
                                        <span class="leading-tight">
                                            <span class="block text-sm font-semibold text-ink">{{ $author }}</span>
                                            <span class="block text-xs text-ink-3">Author</span>
                                        </span>
                                    </span>
                                    @if (! empty($blog['date']) || ! empty($blog['readTime']))
                                        <span class="hidden h-8 w-px bg-white/10 sm:block"></span>
                                    @endif
                                @endif
                                @if (! empty($blog['date']))
                                    <span class="inline-flex items-center gap-2 text-sm text-ink-3">
                                        <x-icon name="CalendarDays" class="h-4 w-4 text-brand-3" />
                                        {{ $blog['date'] }}
                                    </span>
                                @endif
                                @if (! empty($blog['readTime']))
                                    <span class="inline-flex items-center gap-2 text-sm text-ink-3">
                                        <x-icon name="Clock" class="h-4 w-4 text-brand-3" />
                                        {{ $blog['readTime'] }}
                                    </span>
                                @endif
                            </div>
                        @endif
                    </div>
                </x-reveal>
            </x-container>
        </section>

        {{-- ===================== slider ===================== --}}
        @if (count($images) > 0)
            <x-container class="max-w-4xl pb-4">
                <x-reveal>
                    <x-image-slider :images="$images" :alt="$blog['title'] ?? ''" />
                </x-reveal>
            </x-container>
        @endif

        {{-- ===================== body ===================== --}}
        <x-container class="max-w-3xl py-12 md:py-16">
            <x-reveal>
                <div class="flex flex-col gap-6">
                    @if (! empty($blog['excerpt']))
                        <p class="border-l-2 border-brand-2/60 pl-5 text-lg font-medium leading-relaxed text-ink md:text-xl">
                            {{ $blog['excerpt'] }}
                        </p>
                    @endif
                    <div class="flex flex-col gap-5">
                        {{-- Blank-line-separated paragraphs; the first gets an
                             editorial drop cap. --}}
                        @foreach ($paragraphs as $i => $paragraph)
                            <p @class([
                                'text-[15px] leading-relaxed text-ink-2 md:text-[17px] md:leading-8',
                                'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.7] first-letter:text-brand-3' => $i === 0,
                            ])>{{ $paragraph }}</p>
                        @endforeach
                    </div>
                </div>
            </x-reveal>

            @if (count($tags) > 0)
                <x-reveal>
                    <div class="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-8">
                        @foreach ($tags as $tag)
                            <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink">#{{ $tag }}</span>
                        @endforeach
                    </div>
                </x-reveal>
            @endif

            {{-- CTA --}}
            @if ($calendly)
                <x-reveal>
                    <div class="relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 text-center md:p-10">
                        <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"></div>
                        <p class="relative font-display text-xl font-semibold text-ink md:text-2xl">Building something worth writing about?</p>
                        <p class="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-2">
                            Let&rsquo;s talk about how we can help you ship it.
                        </p>
                        <div class="relative mt-6 flex justify-center">
                            <x-button :href="$calendly" magnetic with-arrow>Book a call</x-button>
                        </div>
                    </div>
                </x-reveal>
            @endif
        </x-container>

        {{-- ===================== prev / next ===================== --}}
        @if ($prev || $next)
            <x-container class="max-w-4xl pb-24 md:pb-32">
                <div class="grid gap-4 sm:grid-cols-2">
                    @include('pages.partials.blog-nav', ['blog' => $prev, 'direction' => 'prev'])
                    @include('pages.partials.blog-nav', ['blog' => $next, 'direction' => 'next'])
                </div>
            </x-container>
        @endif
    </article>
@endsection
