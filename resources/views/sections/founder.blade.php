@php
    $founder = $content['founder'] ?? [];
    $links = array_slice(
        array_values(array_filter($content['socials'] ?? [], fn ($s) => ! empty($s['label']) && ! empty($s['href']))),
        0,
        4,
    );
@endphp

<x-section id="studio" class="relative overflow-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-brand/12 blur-[140px]"></div>

    <x-container class="relative">
        <div class="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            {{-- ---------- portrait card ---------- --}}
            <x-reveal>
                <div class="group relative mx-auto w-full max-w-sm">
                    <div aria-hidden="true" class="absolute -inset-6 rounded-[2.75rem] bg-brand/22 opacity-70 blur-3xl transition-opacity duration-700 group-hover:opacity-100"></div>

                    <div class="frame-gradient relative rounded-[2rem]">
                        <div class="glass relative overflow-hidden rounded-[calc(2rem-1px)] p-6 sm:p-8">
                            <div aria-hidden="true" class="grid-lines pointer-events-none absolute inset-0 opacity-30"></div>
                            <div aria-hidden="true" class="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/25 blur-[70px]"></div>

                            {{-- status pill --}}
                            <div class="relative flex justify-end">
                                <span class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium tracking-wide text-ink-2">
                                    <span class="relative flex h-1.5 w-1.5">
                                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70"></span>
                                        <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                    </span>
                                    Available for projects
                                </span>
                            </div>

                            <div class="relative mt-4 flex flex-col items-center text-center">
                                {{-- monogram inside a rotating gradient ring --}}
                                <div class="relative h-32 w-32">
                                    <div aria-hidden="true" class="absolute inset-0 animate-spin-slow rounded-full [background:conic-gradient(from_0deg,transparent_0deg,var(--color-brand-2)_90deg,var(--color-brand-3)_170deg,transparent_300deg)]"></div>
                                    <span class="absolute inset-[5px] grid place-items-center rounded-full btn-brand font-display text-4xl font-bold text-white shadow-[var(--shadow-brand)]">
                                        {{ $founder['initials'] ?? '' }}
                                    </span>
                                    <span aria-hidden="true" class="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-card ring-1 ring-white/10">
                                        <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"></span>
                                    </span>
                                </div>

                                @if (! empty($founder['name']))
                                    <h3 class="mt-6 font-display text-xl font-semibold text-ink">{{ $founder['name'] }}</h3>
                                @endif
                                @if (! empty($founder['role']))
                                    <p class="mt-1 text-sm text-brand-3">{{ $founder['role'] }}</p>
                                @endif

                                <div class="my-6 h-px w-16 bg-linear-to-r from-transparent via-white/25 to-transparent"></div>

                                @if (count($links) > 0)
                                    <div class="flex items-center gap-2.5">
                                        @foreach ($links as $social)
                                            <a
                                                href="{{ $social['href'] }}"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="{{ $social['label'] }}"
                                                title="{{ $social['label'] }}"
                                                class="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-brand/10 hover:text-ink hover:shadow-[var(--shadow-brand)]"
                                            >
                                                <x-social-glyph :label="$social['label']" />
                                            </a>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </x-reveal>

            {{-- ---------- story ---------- --}}
            <div>
                <x-reveal>
                    <x-badge>The Studio</x-badge>
                </x-reveal>

                @if (! empty($founder['story']))
                    <x-reveal :delay="0.06">
                        <blockquote class="relative mt-7">
                            <span aria-hidden="true" class="pointer-events-none absolute -left-3 -top-10 select-none font-display text-8xl leading-none text-brand/20">&ldquo;</span>
                            <p class="text-ink-gradient relative text-balance font-display text-2xl font-medium leading-snug sm:text-[28px] md:text-[32px]">
                                {{ $founder['story'] }}
                            </p>
                        </blockquote>
                    </x-reveal>
                @endif

                @if (! empty($founder['mission']) || ! empty($founder['vision']))
                    <div class="mt-8 grid gap-4 sm:grid-cols-2">
                        @if (! empty($founder['mission']))
                            <x-reveal :delay="0.1">
                                <div class="group card-lux lift sheen relative h-full overflow-hidden rounded-[22px] p-6">
                                    <span class="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
                                        <x-icon name="Target" class="h-5 w-5" />
                                    </span>
                                    <p class="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-3">Mission</p>
                                    <p class="mt-2.5 text-sm leading-relaxed text-ink-2">{{ $founder['mission'] }}</p>
                                </div>
                            </x-reveal>
                        @endif
                        @if (! empty($founder['vision']))
                            <x-reveal :delay="0.16">
                                <div class="group card-lux lift sheen relative h-full overflow-hidden rounded-[22px] p-6">
                                    <span class="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
                                        <x-icon name="Compass" class="h-5 w-5" />
                                    </span>
                                    <p class="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-3">Vision</p>
                                    <p class="mt-2.5 text-sm leading-relaxed text-ink-2">{{ $founder['vision'] }}</p>
                                </div>
                            </x-reveal>
                        @endif
                    </div>
                @endif

                @if (! empty($founder['name']))
                    <x-reveal :delay="0.2">
                        <p class="mt-9 flex items-center gap-3 font-display text-lg text-ink-3">
                            <span aria-hidden="true" class="h-px w-10 bg-linear-to-r from-brand-2 to-transparent"></span>
                            {{ explode(' ', $founder['name'])[0] }}, on why {{ \App\Support\Site::NAME }} exists
                        </p>
                    </x-reveal>
                @endif
            </div>
        </div>
    </x-container>
</x-section>
