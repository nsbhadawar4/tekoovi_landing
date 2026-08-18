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

    // A thin story can't fill a column beside the ~340px sidebar, and the
    // leftover run of empty space reads as a bug. In that case the narrative
    // goes full width and the two cards sit side by side under it instead.
    $thinStory = count($chapters) < 2 && trim($project['quote'] ?? '') === '';

    $facts = array_values(array_filter([
        ['icon' => 'MapPin', 'label' => 'Location', 'value' => $project['country'] ?? ''],
        ['icon' => 'CalendarDays', 'label' => 'Year', 'value' => trim($project['year'] ?? '')],
        ['icon' => 'Timer', 'label' => 'Timeline', 'value' => trim($project['duration'] ?? '')],
        ['icon' => 'TrendingUp', 'label' => 'Headline result', 'value' => $project['result'] ?? ''],
    ], fn ($f) => $f['value'] !== ''));

    $calendly = $content['contact']['calendly'] ?? '';
@endphp

@section('content')
    <article class="relative">
        {{-- ambient wash of the cover behind the top of the page --}}
        @if (! empty($project['image']))
            <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1600px] overflow-hidden">
                <div class="absolute inset-0 scale-125 bg-cover bg-center opacity-40 blur-[130px] saturate-150" style="background-image: url('{{ $project['image'] }}')"></div>
                <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,15,0.45),rgba(8,9,15,0.9)_45%,var(--color-bg))]"></div>
            </div>
        @endif

        {{-- ========================= hero ========================= --}}
        <section class="relative flex min-h-[80svh] items-end overflow-hidden pb-16 pt-28 md:min-h-[90svh] md:pb-24 md:pt-28">
            <div aria-hidden="true" class="absolute inset-0">
                @if (! empty($project['image']))
                    {{-- A contained image resting on a blurred fill of itself —
                         no letterbox gaps whatever the source ratio. --}}
                    <div class="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125" style="background-image: url('{{ $project['image'] }}')"></div>
                    <img src="{{ $project['image'] }}" alt="{{ $project['name'] ?? '' }} — {{ $project['category'] ?? '' }}" class="absolute inset-0 top-[60px] h-full w-full object-contain">
                @else
                    <div class="absolute inset-0">
                        <div class="absolute inset-0 bg-linear-to-br {{ $project['accent'] ?? '' }}"></div>
                        <div class="grid-lines absolute inset-0 opacity-40"></div>
                        <span class="absolute inset-0 grid place-items-center font-display text-[16rem] font-bold leading-none text-white/[0.06]">
                            {{ mb_substr($project['name'] ?? '', 0, 1) }}
                        </span>
                    </div>
                @endif
                {{-- cinematic legibility gradient blending into the page bg --}}
                <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,15,0.85),rgba(8,9,15,0.2)_58%,transparent)]"></div>
            </div>
            <x-aurora class="opacity-35" />
            <x-grid-backdrop class="opacity-50" />

            <x-container class="relative z-10">
                <x-reveal>
                    <a href="/#work" class="group inline-flex items-center gap-2.5 text-sm font-medium text-ink-2 transition-colors hover:text-ink">
                        <span class="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.05] backdrop-blur transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                            <x-icon name="ArrowLeft" class="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        </span>
                        Back to selected work
                    </a>
                </x-reveal>

                <x-reveal :delay="0.06" :y="30">
                    <div class="glass relative mt-8 overflow-hidden rounded-[28px] p-7 md:mt-10 md:p-10">
                        {{-- top brand accent hairline --}}
                        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-2/70 to-transparent"></div>

                        @if (! empty($project['category']))
                            <x-badge>{{ $project['category'] }}</x-badge>
                        @endif

                        @if (! empty($project['name']))
                            <h1 class="text-ink-gradient mt-6 text-balance text-[2.5rem] font-semibold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                                {{ $project['name'] }}
                            </h1>
                        @endif

                        @if (! empty($project['description']))
                            <p class="mt-5 text-pretty text-base leading-relaxed text-ink-2 md:text-lg">{{ $project['description'] }}</p>
                        @endif

                        @if (count($facts) > 0)
                            <div class="mt-7 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-6">
                                @foreach ($facts as $fact)
                                    <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-ink-2 backdrop-blur transition-colors hover:border-white/20 hover:text-ink">
                                        <x-icon :name="$fact['icon']" class="h-3.5 w-3.5 text-brand-3" />
                                        {{ $fact['value'] }}
                                    </span>
                                @endforeach
                            </div>
                        @endif

                        <div class="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            @if ($calendly)
                                <x-button :href="$calendly" size="lg" magnetic with-arrow>Start a project like this</x-button>
                            @endif
                            <x-button href="/#work" variant="ghost" size="lg">See more work</x-button>
                        </div>
                    </div>
                </x-reveal>
            </x-container>
        </section>

        {{-- ======================= fact strip ======================= --}}
        @if (count($facts) > 0)
            <x-container class="relative z-10 -mt-10 md:-mt-14">
                <x-reveal>
                    <dl class="glass grid grid-cols-2 gap-px overflow-hidden rounded-[22px] md:grid-cols-4">
                        @foreach ($facts as $fact)
                            <div class="group relative flex flex-col gap-4 p-6 transition-colors duration-300 hover:bg-white/[0.03]">
                                <span class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-brand/10 text-brand-3 transition-colors duration-300 group-hover:bg-brand/20">
                                    <x-icon :name="$fact['icon']" class="h-[18px] w-[18px]" />
                                </span>
                                <div>
                                    <dt class="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-3">{{ $fact['label'] }}</dt>
                                    <dd class="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">{{ $fact['value'] }}</dd>
                                </div>
                            </div>
                        @endforeach
                    </dl>
                </x-reveal>
            </x-container>
        @endif

        {{-- ======================== highlights ====================== --}}
        @if (count($highlights) > 0)
            <x-container class="mt-6">
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    @foreach (array_slice($highlights, 0, 8) as $i => $highlight)
                        <x-reveal :delay="($i % 4) * 0.06">
                            <div class="card-hairline group relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
                                <div aria-hidden="true" class="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-brand/15 opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>
                                <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs tabular-nums text-brand-3">
                                    {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                </span>
                                <p class="mt-4 font-display text-lg font-semibold leading-snug text-ink">{{ $highlight }}</p>
                            </div>
                        </x-reveal>
                    @endforeach
                </div>
            </x-container>
        @endif

        {{-- ========================== body ========================== --}}
        <x-container class="py-20 md:py-24">
            <div @class(['grid gap-14', 'lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-20' => ! $thinStory])>
                {{-- narrative --}}
                <div class="min-w-0">
                    <div class="flex flex-col gap-14 md:gap-16">
                        @foreach ($chapters as $i => $chapter)
                            <x-reveal>
                                <section class="relative">
                                    <div class="flex items-center gap-4">
                                        <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-2/30 bg-brand/10 font-mono text-xs tabular-nums text-brand-3">
                                            {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                        </span>
                                        <span aria-hidden="true" class="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"></span>
                                    </div>
                                    <h2 class="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">{{ $chapter['label'] }}</h2>
                                    <div @class(['mt-5 flex flex-col gap-4', 'max-w-3xl' => $thinStory])>
                                        @foreach (Site::paragraphs($chapter['body']) as $paragraph)
                                            <p class="text-[15px] leading-relaxed text-ink-2 md:text-base">{{ $paragraph }}</p>
                                        @endforeach
                                    </div>
                                </section>
                            </x-reveal>
                        @endforeach
                    </div>

                    @if (trim($project['quote'] ?? '') !== '')
                        <x-reveal>
                            <figure class="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.16),rgba(255,255,255,0.02))] p-8 md:p-10">
                                <div aria-hidden="true" class="grid-lines pointer-events-none absolute inset-0 opacity-30"></div>
                                <div aria-hidden="true" class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/20 blur-3xl"></div>
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

                {{-- side cards — a sticky rail beside a full story, a row under a
                     thin one --}}
                <aside @class([
                    'grid gap-4 md:grid-cols-2' => $thinStory,
                    'lg:sticky lg:top-28 lg:self-start' => ! $thinStory,
                ])>
                    <div class="card-elevated rounded-2xl p-6">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">At a glance</p>

                        @if (count($services) > 0)
                            <div class="mt-6">
                                <p class="text-[11px] uppercase tracking-[0.12em] text-ink-3">Services</p>
                                <ul class="mt-3 flex flex-col gap-2.5">
                                    @foreach ($services as $service)
                                        <li class="flex items-center gap-2.5 text-sm text-ink-2">
                                            <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-3/70 shadow-[0_0_8px_1px_rgba(179,136,255,0.6)]"></span>
                                            {{ $service }}
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        @if (count($tech) > 0)
                            <div class="mt-6">
                                <p class="text-[11px] uppercase tracking-[0.12em] text-ink-3">Stack</p>
                                <div class="mt-3 flex flex-wrap gap-2">
                                    @foreach ($tech as $item)
                                        <span class="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-white/20 hover:text-ink">{{ $item }}</span>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>

                    <div @class([
                        'relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.18),rgba(255,255,255,0.02))] p-6',
                        'mt-4' => ! $thinStory,
                    ])>
                        <div aria-hidden="true" class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/25 blur-3xl"></div>
                        <p class="relative font-display text-lg font-semibold text-ink">Building something similar?</p>
                        <p class="relative mt-2 text-sm leading-relaxed text-ink-2">
                            Tell us where you are — we&rsquo;ll map the fastest route to a shipped product.
                        </p>
                        @if ($calendly)
                            <x-button :href="$calendly" variant="secondary" with-arrow class="relative mt-6 w-full">Book a call</x-button>
                        @endif
                    </div>
                </aside>
            </div>
        </x-container>

        {{-- ========================= gallery ======================== --}}
        @if (count($gallery) > 0)
            <x-container class="pb-10 md:pb-14">
                <x-reveal>
                    <div class="flex items-center gap-4">
                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Inside the product</p>
                        <span aria-hidden="true" class="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"></span>
                    </div>
                </x-reveal>
                <div @class(['mt-8 grid gap-5', 'md:grid-cols-2' => count($gallery) > 1])>
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
                                    <div aria-hidden="true" class="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent"></div>
                                </div>
                            </div>
                        </x-reveal>
                    @endforeach
                </div>
            </x-container>
        @endif

        {{-- ======================= next project ===================== --}}
        @if ($next)
            <x-container class="pb-12 md:pb-16">
                <x-reveal>
                    <a href="{{ Site::projectHref($next) }}" class="group block">
                        <div data-glow-card class="group card-hairline relative overflow-hidden rounded-2xl p-5 transition-colors duration-300 hover:border-white/15 md:p-7">
                            <div
                                aria-hidden="true"
                                class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style="background: radial-gradient(560px circle at var(--mx, 50%) var(--my, 0%), rgba(138,92,255,0.15), transparent 65%)"
                            ></div>
                            <div class="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                <div class="flex min-w-0 items-center gap-6">
                                    <div class="relative hidden aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:block">
                                        @if (! empty($next['image']))
                                            <img src="{{ $next['image'] }}" alt="{{ $next['name'] ?? '' }}" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105">
                                        @else
                                            <div class="absolute inset-0">
                                                <div class="absolute inset-0 bg-linear-to-br {{ $next['accent'] ?? '' }}"></div>
                                                <div class="grid-lines absolute inset-0 opacity-40"></div>
                                                <span class="absolute inset-0 grid place-items-center font-display text-5xl font-bold leading-none text-white/[0.06]">
                                                    {{ mb_substr($next['name'] ?? '', 0, 1) }}
                                                </span>
                                            </div>
                                        @endif
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Next case study</p>
                                        @if (! empty($next['name']))
                                            <p class="mt-2.5 font-display text-3xl font-semibold text-ink transition-colors group-hover:text-brand-3 md:text-4xl">{{ $next['name'] }}</p>
                                        @endif
                                        @if (! empty($next['category']))
                                            <p class="mt-1.5 text-sm text-ink-2">{{ $next['category'] }}</p>
                                        @endif
                                    </div>
                                </div>
                                <span class="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3 md:pr-2">
                                    View case study
                                    <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </span>
                            </div>
                        </div>
                    </a>
                </x-reveal>
            </x-container>
        @endif
    </article>
@endsection
