@php
    $why = $content['why'] ?? [];
    $promises = ['Senior-led', 'No middlemen', 'Outcome-first'];
@endphp

<x-section id="why" class="relative overflow-hidden bg-bg-2">
    {{-- ambient brand glow --}}
    <div aria-hidden="true" class="pointer-events-none absolute -right-28 top-10 h-[520px] w-[520px] rounded-full bg-brand/12 blur-[140px]"></div>

    <x-container class="relative">
        <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            {{-- ---------- left: sticky pitch ---------- --}}
            <div class="lg:sticky lg:top-28 lg:self-start">
                <x-reveal>
                    <x-badge>Why Tekoovi</x-badge>
                </x-reveal>
                <x-reveal :delay="0.06">
                    <h2 class="text-ink-gradient mt-6 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]">
                        A studio built the way we&rsquo;d want to be hired
                    </h2>
                </x-reveal>
                <x-reveal :delay="0.12">
                    <p class="mt-6 max-w-md text-pretty text-base leading-relaxed text-ink-2">
                        No middlemen, no template factory. Just senior people who care
                        about your outcomes as much as the craft.
                    </p>
                </x-reveal>

                <x-reveal :delay="0.18">
                    <ul class="mt-8 flex flex-col gap-3">
                        @foreach ($promises as $promise)
                            <li class="flex items-center gap-3 text-sm font-medium text-ink-2">
                                <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand-2/30 bg-brand/10 text-brand-3">
                                    <x-icon name="Check" class="h-3.5 w-3.5" />
                                </span>
                                {{ $promise }}
                            </li>
                        @endforeach
                    </ul>
                </x-reveal>
            </div>

            {{-- ---------- right: reason rows ---------- --}}
            <div data-reveal-group data-stagger="0.07" class="flex flex-col gap-3 sm:gap-4">
                @foreach ($why as $i => $item)
                    <div data-reveal-item>
                        <div class="group card-lux sheen relative flex gap-5 overflow-hidden rounded-[22px] p-5 transition-transform duration-500 ease-out-expo hover:translate-x-1 sm:gap-6 sm:p-7">
                            {{-- accent bar that grows on hover --}}
                            <span aria-hidden="true" class="absolute left-0 top-7 h-0 w-[3px] rounded-r-full bg-linear-to-b from-brand-2 to-brand transition-all duration-500 group-hover:h-16"></span>
                            <div aria-hidden="true" class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>

                            @if (! empty($item['icon']))
                                <span class="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
                                    <x-icon :name="$item['icon']" class="h-5 w-5" />
                                </span>
                            @endif

                            <div class="relative min-w-0 flex-1">
                                <div class="flex items-start justify-between gap-4">
                                    @if (! empty($item['title']))
                                        <h3 class="font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
                                            {{ $item['title'] }}
                                        </h3>
                                    @endif
                                    <span class="font-mono text-xs tabular-nums text-ink-3/40">
                                        {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                    </span>
                                </div>
                                @if (! empty($item['description']))
                                    <p class="mt-2 text-sm leading-relaxed text-ink-2">{{ $item['description'] }}</p>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </x-container>
</x-section>
