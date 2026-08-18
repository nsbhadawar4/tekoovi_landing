@php $services = $content['services'] ?? []; @endphp

{{--
  Bento grid: the highlighted service takes a double-width tile, the rest fill
  in around it. Every tile carries the same anatomy — icon, index, title, copy,
  hover reveal — so the layout can vary without the design feeling loose.
--}}
<x-section id="services" class="relative overflow-hidden bg-bg-2">
    <div aria-hidden="true" class="pointer-events-none absolute -left-40 top-24 h-[460px] w-[460px] rounded-full bg-brand/10 blur-[140px]"></div>

    <x-container class="relative">
        <x-section-heading
            eyebrow="What we do"
            title="Everything a product needs, under one roof"
            description="From first pixel to production scale — a single senior team across design, engineering, AI and growth."
        />

        <div data-reveal-group data-stagger="0.06" class="mt-14 grid auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-3">
            @foreach ($services as $i => $service)
                @php $featured = ($service['featured'] ?? false) === true; @endphp
                <div data-reveal-item @class(['h-full', 'sm:col-span-2' => $featured])>
                    <article @class([
                        'group card-lux border-glow lift sheen relative flex h-full min-h-[15.5rem] flex-col gap-6 overflow-hidden rounded-[24px] p-6 sm:p-8',
                        'sm:flex-row sm:items-center sm:gap-10' => $featured,
                    ])>
                        {{-- wash that fades up on hover --}}
                        <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_15%_110%,rgba(138,92,255,0.16),transparent_70%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
                        @if ($featured)
                            <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,rgba(138,92,255,0.14),transparent_58%)]"></div>
                        @endif

                        <div class="relative flex items-start justify-between gap-4 sm:flex-col sm:items-start">
                            @if (! empty($service['icon']))
                                <span @class([
                                    'grid h-14 w-14 shrink-0 place-items-center rounded-2xl border transition-all duration-500 group-hover:-translate-y-1',
                                    'btn-brand border-transparent text-white' => $featured,
                                    'border-white/10 bg-white/[0.03] text-brand-3 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]' => ! $featured,
                                ])>
                                    <x-icon :name="$service['icon']" class="h-6 w-6" />
                                </span>
                            @endif
                            <span class="ml-auto font-mono text-xs tabular-nums text-ink-3/50 sm:ml-0 sm:hidden">
                                {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                            </span>
                        </div>

                        <div class="relative flex flex-1 flex-col">
                            <div class="flex items-baseline gap-3">
                                @if (! empty($service['title']))
                                    <h3 class="font-display text-xl font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
                                        {{ $service['title'] }}
                                    </h3>
                                @endif
                                <span class="ml-auto hidden font-mono text-xs tabular-nums text-ink-3/50 sm:block">
                                    {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                </span>
                            </div>

                            @if (! empty($service['description']))
                                <p @class([
                                    'mt-3 text-sm leading-relaxed text-ink-2',
                                    'max-w-xl text-[15px]' => $featured,
                                ])>{{ $service['description'] }}</p>
                            @endif

                            <span class="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3 transition-colors duration-300 group-hover:text-brand-3">
                                <span aria-hidden="true" class="h-px w-8 bg-linear-to-r from-brand-2/70 to-transparent transition-all duration-500 group-hover:w-14"></span>
                                Learn more
                                <x-icon name="ArrowUpRight" class="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </div>
                    </article>
                </div>
            @endforeach
        </div>
    </x-container>
</x-section>
