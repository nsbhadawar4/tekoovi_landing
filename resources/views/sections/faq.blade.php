@php
    // A question switched off in the admin leaves nothing to open.
    $items = array_values(array_filter($content['faqs'] ?? [], fn ($f) => ! empty($f['q'])));
    $calendly = $content['contact']['calendly'] ?? '';
@endphp

<x-section id="faq" class="relative overflow-hidden">
    <span data-scroll-target aria-hidden="true" class="absolute top-24 md:top-32"></span>
    <div aria-hidden="true" class="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-brand/10 blur-[140px]"></div>

    <x-container class="relative">
        <div class="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            {{-- ---------- left: heading + help card ---------- --}}
            <div class="lg:sticky lg:top-28 lg:self-start">
                <x-reveal>
                    <x-badge>FAQ</x-badge>
                </x-reveal>
                <x-reveal :delay="0.06">
                    <h2 class="text-ink-gradient mt-6 text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]">
                        Answers before you ask
                    </h2>
                </x-reveal>
                <x-reveal :delay="0.12">
                    <p class="mt-5 max-w-md text-pretty text-base leading-relaxed text-ink-2">
                        The questions founders ask us most, answered plainly. Anything
                        we&rsquo;ve missed, we&rsquo;ll happily walk you through.
                    </p>
                </x-reveal>

                @if ($calendly)
                    <x-reveal :delay="0.18">
                        <div class="card-lux relative mt-8 overflow-hidden rounded-[22px] p-6">
                            <div aria-hidden="true" class="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-brand/25 blur-2xl"></div>
                            <span class="relative grid h-11 w-11 place-items-center rounded-xl btn-brand text-white">
                                <x-icon name="MessagesSquare" class="h-5 w-5" />
                            </span>
                            <p class="relative mt-5 font-display text-lg font-semibold text-ink">Still have a question?</p>
                            <p class="relative mt-2 text-sm leading-relaxed text-ink-2">
                                Grab a 30-minute slot — we&rsquo;ll answer it and sketch out
                                what building it would take.
                            </p>
                            <x-button :href="$calendly" with-arrow class="relative mt-6 w-full">Book a call</x-button>
                        </div>
                    </x-reveal>
                @endif
            </div>

            {{-- ---------- right: accordion ---------- --}}
            <div data-accordion class="flex flex-col gap-3">
                @foreach ($items as $i => $faq)
                    <x-reveal :delay="min($i, 5) * 0.04" data-accordion-item>
                        <div data-accordion-card class="card-lux group relative overflow-hidden rounded-[20px] transition-colors duration-500">
                            <div data-accordion-wash aria-hidden="true" class="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(420px_circle_at_10%_0%,rgba(138,92,255,0.14),transparent_70%)]"></div>

                            <button
                                type="button"
                                data-accordion-trigger
                                aria-expanded="false"
                                class="relative flex w-full items-center gap-4 p-5 text-left sm:gap-6 sm:p-6"
                            >
                                <span data-accordion-index class="font-mono text-xs tabular-nums text-ink-3/50 transition-colors duration-300">
                                    {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                </span>
                                <span class="flex-1 font-display text-base font-medium leading-snug text-ink sm:text-lg">{{ $faq['q'] }}</span>
                                <span data-accordion-plus class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-ink-2 transition-all duration-500 ease-out-expo group-hover:border-brand-2/40 group-hover:text-brand-3">
                                    <x-icon name="Plus" class="h-4 w-4" />
                                </span>
                            </button>

                            <div data-accordion-panel class="relative">
                                @if (! empty($faq['a']))
                                    <p class="max-w-2xl px-5 pb-6 pl-13 text-sm leading-relaxed text-ink-2 sm:px-6 sm:pl-16">{{ $faq['a'] }}</p>
                                @endif
                            </div>
                        </div>
                    </x-reveal>
                @endforeach
            </div>
        </div>
    </x-container>
</x-section>
