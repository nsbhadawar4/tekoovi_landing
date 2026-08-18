@php
    use App\Support\Site;

    $featured = array_slice(array_values($content['projects'] ?? []), 0, 6);
@endphp

{{--
  Client stories as a swipeable rail.

  Cards are wide and image-led — one story at a time on a phone, two and a half
  on a desktop so the rail visibly continues past the fold.
--}}
@if (count($featured) > 0)
    <x-section id="case-study" class="relative overflow-hidden bg-bg-2">
        <div aria-hidden="true" class="pointer-events-none absolute -left-32 top-1/4 h-[460px] w-[460px] rounded-full bg-brand/12 blur-[140px]"></div>

        <x-container class="relative">
            <x-section-heading
                align="left"
                eyebrow="Case Studies"
                title="Client success stories"
                description="Real engagements, real numbers — swipe through the work behind the results."
            >
                <x-slot:action>
                    <x-button href="/#work" variant="secondary" with-arrow>View all work</x-button>
                </x-slot:action>
            </x-section-heading>

            <x-reveal class="mt-12 sm:mt-14">
                <x-carousel label="Client success stories" auto-play show-progress>
                    @foreach ($featured as $i => $project)
                        <li aria-roledescription="slide" aria-label="{{ $i + 1 }} of {{ count($featured) }}" class="shrink-0 snap-start basis-[78%] sm:basis-[46%] lg:basis-[31.5%]">
                            <a
                                href="{{ Site::caseStudyHref($project) }}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="group card-lux lift sheen relative flex h-full flex-col overflow-hidden rounded-[26px]"
                            >
                                {{-- ---------- visual ---------- --}}
                                <div class="relative aspect-[16/11] overflow-hidden">
                                    @if (! empty($project['image']))
                                        <img
                                            src="{{ $project['image'] }}"
                                            alt="{{ $project['name'] ?? '' }} — {{ $project['category'] ?? '' }}"
                                            loading="lazy"
                                            decoding="async"
                                            class="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.08]"
                                        >
                                    @else
                                        <div class="absolute inset-0">
                                            <div class="absolute inset-0 bg-linear-to-br {{ $project['accent'] ?? '' }}"></div>
                                            <div class="grid-lines absolute inset-0 opacity-40"></div>
                                            <span class="absolute inset-0 grid place-items-center font-display text-[6rem] font-bold leading-none text-white/[0.06]">
                                                {{ mb_substr($project['name'] ?? '', 0, 1) }}
                                            </span>
                                        </div>
                                    @endif

                                    <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95"></div>

                                    @if (! empty($project['category']))
                                        <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
                                            {{ $project['category'] }}
                                        </span>
                                    @endif

                                    <span class="absolute bottom-4 left-4 inline-flex translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#0f1117] opacity-0 shadow-lg transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
                                        Read case study
                                        <x-icon name="ArrowUpRight" class="h-3.5 w-3.5" />
                                    </span>
                                </div>

                                {{-- ---------- body ---------- --}}
                                <div class="flex flex-1 flex-col p-5 sm:p-6">
                                    @if (! empty($project['name']))
                                        <h3 class="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3 sm:text-xl">
                                            {{ $project['name'] }}
                                        </h3>
                                    @endif
                                    @if (! empty($project['description']))
                                        <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-2">{{ $project['description'] }}</p>
                                    @endif

                                    {{-- headline metric — the reason anyone reads a case study --}}
                                    @if (! empty($project['result']))
                                        <div class="mt-4 flex items-center gap-2.5 rounded-xl border border-brand-2/25 bg-brand/10 px-3.5 py-2.5">
                                            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg btn-brand text-white">
                                                <x-icon name="TrendingUp" class="h-3.5 w-3.5" />
                                            </span>
                                            <p class="text-[13px] font-semibold leading-snug text-ink">{{ $project['result'] }}</p>
                                        </div>
                                    @endif

                                    <div class="mt-auto flex items-center justify-between gap-4 pt-5">
                                        @if (! empty($project['country']))
                                            <span class="inline-flex items-center gap-1.5 text-xs text-ink-3">
                                                <x-icon name="MapPin" class="h-3.5 w-3.5" />
                                                {{ $project['country'] }}
                                            </span>
                                        @else
                                            <span></span>
                                        @endif
                                        <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
                                            Read story
                                            <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </span>
                                    </div>
                                </div>
                            </a>
                        </li>
                    @endforeach
                </x-carousel>
            </x-reveal>
        </x-container>
    </x-section>
@endif
