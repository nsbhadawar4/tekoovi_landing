@extends('layouts.app')

@php
    use App\Support\Site;

    $chapters = array_values(array_filter([
        ['label' => 'Overview', 'body' => trim($project['overview'] ?? '') ?: ($project['description'] ?? '')],
        ['label' => 'The challenge', 'body' => trim($project['challenge'] ?? '')],
        ['label' => 'What we built', 'body' => trim($project['solution'] ?? '')],
        ['label' => 'The outcome', 'body' => trim($project['outcome'] ?? '')],
    ], fn ($c) => $c['body'] !== ''));

    $highlights = array_values(array_filter($project['highlights'] ?? []));
    $services = array_values(array_filter($project['services'] ?? []));
    $tech = array_values(array_filter($project['tech'] ?? []));
    $gallery = array_values(array_filter(array_map('trim', [
        $project['gallery1'] ?? '', $project['gallery2'] ?? '', $project['gallery3'] ?? '',
    ])));

    $facts = array_values(array_filter([
        ['icon' => 'MapPin', 'label' => 'Location', 'value' => $project['country'] ?? ''],
        ['icon' => 'CalendarDays', 'label' => 'Year', 'value' => trim($project['year'] ?? '')],
        ['icon' => 'Timer', 'label' => 'Timeline', 'value' => trim($project['duration'] ?? '')],
        ['icon' => 'TrendingUp', 'label' => 'Result', 'value' => $project['result'] ?? ''],
    ], fn ($f) => $f['value'] !== ''));

    $calendly = $content['contact']['calendly'] ?? '';
@endphp

@section('content')
    <article class="relative">
        {{-- ambient background --}}
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
            <x-aurora class="opacity-40" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,transparent,transparent_60%,var(--color-bg))]"></div>
        </div>

        {{-- ===================== split hero ===================== --}}
        <section class="relative pt-28 pb-14 md:pt-32 md:pb-20">
            <x-container>
                <x-reveal>
                    <a href="/#case-study" class="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink">
                        <span class="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                            <x-icon name="ArrowLeft" class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        </span>
                        Back to case studies
                    </a>
                </x-reveal>

                <div class="mt-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                    {{-- text --}}
                    <x-reveal :delay="0.06" :y="30">
                        <div>
                            @if (! empty($project['category']))
                                <x-badge>{{ $project['category'] }}</x-badge>
                            @endif
                            @if (! empty($project['name']))
                                <h1 class="text-ink-gradient mt-6 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">
                                    {{ $project['name'] }}
                                </h1>
                            @endif
                            @if (! empty($project['description']))
                                <p class="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-2 md:text-lg">{{ $project['description'] }}</p>
                            @endif

                            @if (count($facts) > 0)
                                <div class="mt-7 flex flex-wrap items-center gap-2.5">
                                    @foreach ($facts as $fact)
                                        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-2 backdrop-blur">
                                            <x-icon :name="$fact['icon']" class="h-3.5 w-3.5 text-brand-3" />
                                            {{ $fact['value'] }}
                                        </span>
                                    @endforeach
                                </div>
                            @endif

                            @if ($calendly)
                                <div class="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                                    <x-button :href="$calendly" size="lg" magnetic with-arrow>Start a project like this</x-button>
                                </div>
                            @endif
                        </div>
                    </x-reveal>

                    {{-- cover --}}
                    <x-reveal :delay="0.12" :y="30">
                        <div class="rounded-[26px] bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_45%,rgba(138,92,255,0.28))] p-px">
                            <div class="relative overflow-hidden rounded-[25px] bg-bg-2">
                                <div class="relative aspect-[4/3] w-full">
                                    @if (! empty($project['image']))
                                        <div aria-hidden="true" class="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125" style="background-image: url('{{ $project['image'] }}')"></div>
                                        <img src="{{ $project['image'] }}" alt="{{ $project['name'] ?? '' }} — {{ $project['category'] ?? '' }}" class="absolute inset-0 h-full w-full object-contain">
                                    @else
                                        <div class="absolute inset-0">
                                            <div class="absolute inset-0 bg-linear-to-br {{ $project['accent'] ?? '' }}"></div>
                                            <div class="grid-lines absolute inset-0 opacity-40"></div>
                                            <span class="absolute inset-0 grid place-items-center font-display text-[8rem] font-bold leading-none text-white/[0.06]">
                                                {{ mb_substr($project['name'] ?? '', 0, 1) }}
                                            </span>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </x-reveal>
                </div>
            </x-container>
        </section>

        {{-- ===================== results band ===================== --}}
        @if (count($highlights) > 0)
            <x-container class="pb-4">
                <x-reveal>
                    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        @foreach (array_slice($highlights, 0, 4) as $i => $highlight)
                            <div class="card-hairline group relative overflow-hidden rounded-2xl p-6">
                                <div aria-hidden="true" class="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand/15 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>
                                <span class="font-mono text-xs tabular-nums text-brand-3/70">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span>
                                <p class="mt-3 font-display text-base font-semibold leading-snug text-ink">{{ $highlight }}</p>
                            </div>
                        @endforeach
                    </div>
                </x-reveal>
            </x-container>
        @endif

        {{-- ============ story (single column, timeline) ============ --}}
        <x-container class="py-16 md:py-20">
            <div class="mx-auto max-w-3xl">
                @if (count($services) > 0 || count($tech) > 0)
                    <x-reveal>
                        <div class="mb-12 flex flex-wrap gap-x-10 gap-y-6 border-b border-white/10 pb-10">
                            @if (count($services) > 0)
                                <div>
                                    <p class="text-[11px] uppercase tracking-[0.14em] text-ink-3">Services</p>
                                    <div class="mt-3 flex flex-wrap gap-2">
                                        @foreach ($services as $service)
                                            <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2">{{ $service }}</span>
                                        @endforeach
                                    </div>
                                </div>
                            @endif
                            @if (count($tech) > 0)
                                <div>
                                    <p class="text-[11px] uppercase tracking-[0.14em] text-ink-3">Stack</p>
                                    <div class="mt-3 flex flex-wrap gap-2">
                                        @foreach ($tech as $item)
                                            <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-2">{{ $item }}</span>
                                        @endforeach
                                    </div>
                                </div>
                            @endif
                        </div>
                    </x-reveal>
                @endif

                {{-- timeline chapters --}}
                <div class="relative flex flex-col gap-12 md:gap-16">
                    <span aria-hidden="true" class="absolute bottom-2 left-[15px] top-2 w-px bg-linear-to-b from-brand-2/40 via-white/10 to-transparent"></span>
                    @foreach ($chapters as $i => $chapter)
                        <x-reveal>
                            <section class="relative pl-12">
                                <span class="absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full border border-brand-2/40 bg-bg font-mono text-xs tabular-nums text-brand-3">
                                    {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                </span>
                                <h2 class="font-display text-2xl font-semibold text-ink md:text-3xl">{{ $chapter['label'] }}</h2>
                                <div class="mt-4 flex flex-col gap-4">
                                    @foreach (Site::paragraphs($chapter['body']) as $paragraph)
                                        <p class="text-[15px] leading-relaxed text-ink-2 md:text-base">{{ $paragraph }}</p>
                                    @endforeach
                                </div>
                            </section>
                        </x-reveal>
                    @endforeach
                </div>

                {{-- quote --}}
                @if (trim($project['quote'] ?? '') !== '')
                    <x-reveal>
                        <figure class="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 md:p-10">
                            <div aria-hidden="true" class="grid-lines pointer-events-none absolute inset-0 opacity-30"></div>
                            <div class="relative">
                                <x-icon name="Quote" class="h-8 w-8 text-brand-3" />
                                <blockquote class="mt-5 font-display text-2xl font-medium leading-relaxed text-ink md:text-3xl">{{ $project['quote'] }}</blockquote>
                                @if (trim($project['quoteAuthor'] ?? '') !== '')
                                    <figcaption class="mt-6 flex items-center gap-3 text-sm text-ink-3">
                                        <span aria-hidden="true" class="h-px w-8 bg-brand-3/50"></span>
                                        {{ $project['quoteAuthor'] }}
                                    </figcaption>
                                @endif
                            </div>
                        </figure>
                    </x-reveal>
                @endif
            </div>
        </x-container>

        {{-- ===================== gallery ===================== --}}
        @if (count($gallery) > 0)
            <x-container class="pb-16 md:pb-20">
                <x-reveal>
                    <div class="mb-8 flex items-center gap-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Inside the product</p>
                        <span aria-hidden="true" class="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"></span>
                    </div>
                </x-reveal>
                <div @class(['grid gap-5', 'md:grid-cols-2' => count($gallery) > 1])>
                    @foreach ($gallery as $i => $src)
                        <x-reveal
                            :delay="($i % 2) * 0.08"
                            @class(['md:col-span-2' => count($gallery) === 3 && $i === 2])
                        >
                            <div class="group rounded-[26px] bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_45%,rgba(138,92,255,0.28))] p-px">
                                <div class="relative overflow-hidden rounded-[25px] bg-bg-2">
                                    <div class="relative aspect-[16/10] max-h-125 w-full overflow-hidden">
                                        <div class="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                                            <div aria-hidden="true" class="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125" style="background-image: url('{{ $src }}')"></div>
                                            <img src="{{ $src }}" alt="{{ $project['name'] ?? '' }} — screenshot {{ $i + 1 }}" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-contain">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </x-reveal>
                    @endforeach
                </div>
            </x-container>
        @endif

        {{-- ===================== next + closing ===================== --}}
        <x-container class="pb-24 md:pb-28">
            @if ($next)
                <x-reveal>
                    <a href="{{ Site::caseStudyHref($next) }}" class="group card-hairline mb-8 flex items-center justify-between gap-6 rounded-2xl p-6 transition-colors hover:border-white/15 md:p-7">
                        <div class="min-w-0">
                            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Next case study</p>
                            @if (! empty($next['name']))
                                <p class="mt-2 font-display text-2xl font-semibold text-ink transition-colors group-hover:text-brand-3 md:text-3xl">{{ $next['name'] }}</p>
                            @endif
                            @if (! empty($next['category']))
                                <p class="mt-1 text-sm text-ink-2">{{ $next['category'] }}</p>
                            @endif
                        </div>
                        <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink transition-all duration-300 group-hover:border-brand-2/40 group-hover:bg-brand group-hover:text-white">
                            <x-icon name="ArrowUpRight" class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                    </a>
                </x-reveal>
            @endif

            <x-reveal>
                <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-10 text-center md:p-14">
                    <div aria-hidden="true" class="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/25 blur-3xl"></div>
                    <div class="relative mx-auto max-w-2xl">
                        <x-icon name="Sparkles" class="mx-auto h-8 w-8 text-brand-3" />
                        <p class="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">
                            Want results like {{ $project['name'] ?: 'these' }}?
                        </p>
                        <p class="mt-3 text-ink-2">
                            Tell us where you are — we&rsquo;ll map the fastest route to a shipped product.
                        </p>
                        @if ($calendly)
                            <div class="mt-8 flex justify-center">
                                <x-button :href="$calendly" size="lg" magnetic with-arrow>Book a call</x-button>
                            </div>
                        @endif
                    </div>
                </div>
            </x-reveal>
        </x-container>
    </article>
@endsection
