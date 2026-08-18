@php
    use App\Support\Sections;

    $stats = $content['stats'] ?? [];
    $named = array_values(array_filter($content['logos'] ?? [], fn ($l) => ! empty($l['name'])));
@endphp

<section class="relative overflow-hidden border-y border-line bg-bg-2 py-20 md:py-28">
    {{-- ambient depth --}}
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0">
        <div class="mx-auto h-56 w-3/4 max-w-4xl rounded-full bg-brand/12 blur-[120px]"></div>
    </div>
    <div aria-hidden="true" class="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-60"></div>

    <x-container class="relative">
        <x-reveal class="mb-12 text-center">
            <span class="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3 backdrop-blur">
                <span class="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_10px_2px_rgba(138,92,255,0.7)]"></span>
                Trusted by teams building at the edge
            </span>
        </x-reveal>

        {{-- ---------------- stat cards ---------------- --}}
        @if (count($stats) > 0)
            <div data-reveal-group data-stagger="0.07" class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                @foreach ($stats as $i => $stat)
                    <div data-reveal-item class="h-full">
                        <div class="group relative h-full">
                            <div class="card-lux border-glow lift relative h-full overflow-hidden rounded-[22px] p-6 text-center sm:p-8">
                                {{-- corner bloom --}}
                                <div aria-hidden="true" class="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-brand/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>
                                <span aria-hidden="true" class="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-brand-2/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

                                <p class="relative font-mono text-[11px] tabular-nums text-brand-3/60">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</p>

                                {{-- The number is a real 0 sometimes, so an empty value can't
                                     stand in for "hidden" — ask the record directly. --}}
                                @if (! Sections::isHidden($stat, 'value'))
                                    <p class="text-ink-gradient relative mt-3 font-display text-[2.75rem] font-bold leading-none tracking-tight sm:text-5xl">
                                        <span data-counter="{{ (float) ($stat['value'] ?? 0) }}" data-suffix="{{ $stat['suffix'] ?? '' }}">0{{ $stat['suffix'] ?? '' }}</span>
                                    </p>
                                @endif
                                @if (! empty($stat['label']))
                                    <p class="relative mt-3 text-sm leading-snug text-ink-2">{{ $stat['label'] }}</p>
                                @endif
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </x-container>

    {{-- ---------------- client logos ---------------- --}}
    @if (count($named) > 0)
        <div class="relative mt-16">
            <x-reveal class="mb-8 text-center">
                <p class="text-[11px] uppercase tracking-[0.22em] text-ink-3/70">Powering ambitious teams worldwide</p>
            </x-reveal>
            <x-marquee slow>
                @foreach ($named as $logo)
                    <div class="group mx-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3.5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-brand-2/40 hover:bg-white/[0.04] hover:shadow-[var(--shadow-brand)]">
                        <span class="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] font-display text-xs font-bold text-brand-3 transition-colors duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
                            {{ mb_substr($logo['name'], 0, 1) }}
                        </span>
                        <span class="whitespace-nowrap text-base font-semibold tracking-tight text-ink-3 transition-colors duration-500 group-hover:text-ink">
                            {{ $logo['name'] }}
                        </span>
                    </div>
                @endforeach
            </x-marquee>
        </div>
    @endif
</section>
