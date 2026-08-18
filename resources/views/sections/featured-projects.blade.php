@php
    use App\Support\Site;

    $projects = array_values($content['projects'] ?? []);
    // The newest project leads as a wide showcase; the rest form the grid. One
    // hero-sized card gives the section a focal point instead of nine equals.
    $lead = $projects[0] ?? null;
    $rest = array_slice($projects, 1);
@endphp

<x-section id="work">
    <x-container>
        <x-section-heading
            align="left"
            eyebrow="Selected Work"
            title="Products we’re proud to have shipped"
            description="A glimpse of the platforms, apps and systems we've built for founders and teams across the world."
        >
            @if ($lead)
                <x-slot:action>
                    <x-button :href="Site::projectHref($lead)" variant="secondary" with-arrow>
                        Explore the latest build
                    </x-button>
                </x-slot:action>
            @endif
        </x-section-heading>

        @if ($lead)
            {{-- ------------------------- lead showcase ------------------------- --}}
            <x-reveal class="mt-12 sm:mt-16">
                <div class="frame-gradient group relative overflow-hidden rounded-[30px]">
                    <div class="sheen relative grid overflow-hidden rounded-[29px] bg-card lg:grid-cols-[1.1fr_1fr]">
                        {{-- visual --}}
                        <div class="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:min-h-[480px]">
                            @if (! empty($lead['image']))
                                <img
                                    src="{{ $lead['image'] }}"
                                    alt="{{ $lead['name'] ?? '' }} — {{ $lead['category'] ?? '' }}"
                                    loading="lazy"
                                    decoding="async"
                                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.06]"
                                >
                            @else
                                <div class="absolute inset-0">
                                    <div class="absolute inset-0 bg-linear-to-br {{ $lead['accent'] ?? '' }}"></div>
                                    <div class="grid-lines absolute inset-0 opacity-40"></div>
                                    <span class="absolute inset-0 grid place-items-center font-display text-[9rem] font-bold leading-none text-white/[0.06]">
                                        {{ mb_substr($lead['name'] ?? '', 0, 1) }}
                                    </span>
                                </div>
                            @endif

                            <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,rgba(8,9,15,0.55))] lg:bg-[linear-gradient(90deg,transparent_45%,rgba(8,9,15,0.75))]"></div>

                            @if (! empty($lead['category']))
                                <span class="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-3 backdrop-blur">
                                    {{ $lead['category'] }}
                                </span>
                            @endif
                        </div>

                        {{-- copy --}}
                        <div class="relative flex flex-col justify-center gap-6 p-7 sm:p-10 lg:p-12">
                            <div aria-hidden="true" class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand/20 blur-[90px]"></div>

                            <div class="relative flex items-center gap-3">
                                <span class="inline-flex items-center gap-1.5 rounded-full btn-brand px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                                    <x-icon name="Sparkles" class="h-3 w-3" />
                                    Featured
                                </span>
                                @if (! empty($lead['country']))
                                    <span class="inline-flex items-center gap-1.5 text-xs text-ink-3">
                                        <x-icon name="MapPin" class="h-3.5 w-3.5" />
                                        {{ $lead['country'] }}
                                    </span>
                                @endif
                            </div>

                            @if (! empty($lead['name']))
                                <h3 class="text-ink-gradient relative font-display text-3xl font-semibold leading-tight sm:text-4xl">{{ $lead['name'] }}</h3>
                            @endif

                            @if (! empty($lead['description']))
                                <p class="relative max-w-lg text-[15px] leading-relaxed text-ink-2">{{ $lead['description'] }}</p>
                            @endif

                            @if (! empty($lead['result']))
                                <div class="relative flex items-center gap-3 rounded-2xl border border-brand-2/25 bg-brand/10 px-4 py-3">
                                    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl btn-brand text-white">
                                        <x-icon name="ArrowUpRight" class="h-4 w-4" />
                                    </span>
                                    <p class="text-sm font-semibold text-ink">{{ $lead['result'] }}</p>
                                </div>
                            @endif

                            @if (! empty($lead['tech']))
                                <div class="relative flex flex-wrap gap-2">
                                    @foreach (array_slice($lead['tech'], 0, 6) as $tech)
                                        <span class="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-ink-2">{{ $tech }}</span>
                                    @endforeach
                                </div>
                            @endif

                            {{-- The pseudo-element stretches the hit area over the whole card. --}}
                            <a
                                href="{{ Site::projectHref($lead) }}"
                                class="link-underline relative inline-flex w-fit items-center gap-2 self-start pb-1 text-sm font-semibold text-ink after:absolute after:inset-0 after:content-[''] hover:text-brand-3"
                            >
                                View the case study
                                <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </x-reveal>
        @endif

        {{-- --------------------------- grid cards --------------------------- --}}
        @if (count($rest) > 0)
            <div data-reveal-group data-stagger="0.07" class="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                @foreach ($rest as $project)
                    <div data-reveal-item class="h-full">
                        <div data-tilt="7" class="group relative h-full will-change-transform">
                            <div class="card-lux sheen relative flex h-full flex-col overflow-hidden rounded-[24px]">
                                {{-- visual --}}
                                <div class="relative aspect-[16/10] overflow-hidden border-b border-line">
                                    @if (! empty($project['image']))
                                        <img
                                            src="{{ $project['image'] }}"
                                            alt="{{ $project['name'] ?? '' }} — {{ $project['category'] ?? '' }}"
                                            loading="lazy"
                                            decoding="async"
                                            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.08]"
                                        >
                                    @else
                                        <div class="absolute inset-0">
                                            <div class="absolute inset-0 bg-linear-to-br {{ $project['accent'] ?? '' }}"></div>
                                            <div class="grid-lines absolute inset-0 opacity-40"></div>
                                            <span class="absolute inset-0 grid place-items-center font-display text-[7rem] font-bold leading-none text-white/[0.06]">
                                                {{ mb_substr($project['name'] ?? '', 0, 1) }}
                                            </span>
                                        </div>
                                    @endif

                                    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/75 via-black/10 to-transparent"></div>

                                    @if (! empty($project['category']))
                                        <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
                                            {{ $project['category'] }}
                                        </span>
                                    @endif
                                    @if (! empty($project['result']))
                                        <span class="absolute right-3 top-3 max-w-[48%] truncate rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-[var(--shadow-brand)] sm:right-4 sm:top-4 sm:px-3">
                                            {{ $project['result'] }}
                                        </span>
                                    @endif

                                    {{-- slides up on hover --}}
                                    <span class="absolute bottom-4 left-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0f1117] opacity-0 shadow-lg transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
                                        View case study
                                        <x-icon name="ArrowUpRight" class="h-3.5 w-3.5" />
                                    </span>
                                </div>

                                {{-- body --}}
                                <div class="flex flex-1 flex-col p-5 sm:p-6">
                                    @if (! empty($project['name']) || ! empty($project['country']))
                                        <div class="flex items-start justify-between gap-4">
                                            @if (! empty($project['name']))
                                                <h3 class="min-w-0 font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3 sm:text-[1.35rem]">
                                                    {{ $project['name'] }}
                                                </h3>
                                            @endif
                                            @if (! empty($project['country']))
                                                <span class="mt-1 inline-flex max-w-[42%] shrink-0 items-center gap-1 truncate text-xs text-ink-3">
                                                    <x-icon name="MapPin" class="h-3.5 w-3.5" /> {{ $project['country'] }}
                                                </span>
                                            @endif
                                        </div>
                                    @endif

                                    @if (! empty($project['description']))
                                        <p class="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-2">{{ $project['description'] }}</p>
                                    @endif

                                    @if (! empty($project['tech']))
                                        <div class="mt-5 flex flex-wrap gap-2">
                                            @foreach (array_slice($project['tech'], 0, 4) as $tech)
                                                <span class="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-ink-2">{{ $tech }}</span>
                                            @endforeach
                                        </div>
                                    @endif

                                    <a
                                        href="{{ Site::projectHref($project) }}"
                                        class="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-ink transition-colors after:absolute after:inset-0 hover:text-brand-3"
                                    >
                                        View case study
                                        <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </a>
                                </div>
                            </div>
                            <span data-tilt-glare aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </x-container>
</x-section>
