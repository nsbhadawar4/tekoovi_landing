@php $industries = $content['industries'] ?? []; @endphp

<x-section id="industries" class="relative overflow-hidden">
    <div aria-hidden="true" class="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-70"></div>

    <x-container class="relative">
        <x-section-heading
            eyebrow="Industries"
            title="We speak your industry’s language"
            description="Domain fluency that means less explaining and more building — across regulated, high-stakes and fast-moving markets."
        />

        <div data-reveal-group data-stagger="0.05" class="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-16 lg:grid-cols-4">
            @foreach ($industries as $i => $industry)
                <div data-reveal-item class="h-full">
                    <div class="group card-lux lift sheen relative flex h-full min-h-[168px] flex-col justify-between gap-8 overflow-hidden rounded-[22px] p-5 sm:min-h-[186px] sm:p-6">
                        {{-- oversized ghost watermark of the icon --}}
                        @if (! empty($industry['icon']))
                            <x-icon
                                :name="$industry['icon']"
                                class="pointer-events-none absolute -bottom-6 -right-5 h-32 w-32 text-white/[0.04] transition-all duration-700 ease-out-expo group-hover:-rotate-6 group-hover:scale-110 group-hover:text-brand-3/20"
                            />
                        @endif
                        {{-- brand wash rising from the corner --}}
                        <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(180px_circle_at_12%_118%,rgba(138,92,255,0.24),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                        <div class="relative flex items-start justify-between">
                            @if (! empty($industry['icon']))
                                <span class="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-brand-3 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
                                    <x-icon :name="$industry['icon']" class="h-5 w-5" />
                                </span>
                            @endif
                            <span class="ml-auto font-mono text-[11px] tabular-nums text-ink-3/40">
                                {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                            </span>
                        </div>

                        @if (! empty($industry['name']))
                            <span class="relative mt-auto text-[15px] font-semibold leading-snug text-ink">{{ $industry['name'] }}</span>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    </x-container>
</x-section>
