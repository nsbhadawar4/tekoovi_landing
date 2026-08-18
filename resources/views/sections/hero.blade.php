@php
    use App\Support\Sections;

    $hero = $content['hero'] ?? [];
    $stats = $content['stats'] ?? [];
    $testimonials = $content['testimonials'] ?? [];

    $showPrimary = ! empty($hero['primaryLabel']) && ! empty($hero['primaryHref']);
    $showSecondary = ! empty($hero['secondaryLabel']) && ! empty($hero['secondaryHref']);

    // Proof chips: the first two stats that still have both halves showing.
    $proof = array_slice(
        array_filter($stats, fn ($s) => ! empty($s['label']) && ! Sections::isHidden($s, 'value')),
        0,
        2,
    );

    // Real people only — the avatar stack never invents faces.
    $faces = array_slice(
        array_values(array_filter($testimonials, fn ($t) => ! empty($t['initials']))),
        0,
        4,
    );
@endphp

<section
    id="home"
    data-hero
    class="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32 sm:pt-36"
>
    {{-- ---------- background stack ---------- --}}
    @if (! empty($hero['backgroundImage']))
        <div
            data-hero-bg
            aria-hidden="true"
            class="absolute inset-0 bg-cover bg-center"
            style="background-image: url('{{ $hero['backgroundImage'] }}')"
        ></div>
        <div aria-hidden="true" class="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,15,0.62),rgba(8,9,15,0.88))]"></div>
    @endif

    <x-aurora />
    <x-grid-backdrop />

    {{-- cursor spotlight --}}
    <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 z-[1] opacity-70"
        style="background: radial-gradient(560px circle at var(--sx, 50%) var(--sy, 30%), rgba(108,59,255,0.13), transparent 70%)"
    ></div>

    {{-- soft dissolve into the section below --}}
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-40 bg-[linear-gradient(180deg,transparent,var(--color-bg))]"></div>

    {{-- ---------- floating glass chips ---------- --}}
    <div data-hero-floats class="pointer-events-none absolute inset-0 z-[2] hidden lg:block">
        <div data-float-card data-delay="0.7" class="absolute left-[5%] top-[24%]">
            <div class="animate-float">
                <div class="glass rounded-2xl px-4 py-3 shadow-[var(--shadow-e3)]">
                    <div class="flex items-center gap-2.5">
                        <span class="relative flex h-2 w-2">
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70"></span>
                            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                        </span>
                        <span class="text-[13px] font-medium text-ink">Deployed to production</span>
                    </div>
                    <p class="mt-1 text-xs text-ink-3">Build passed &middot; 2.1s</p>
                </div>
            </div>
        </div>

        <div data-float-card data-delay="1.05" class="absolute right-[7%] top-[32%]">
            <div class="animate-float">
                <div class="glass rounded-2xl px-4 py-3 shadow-[var(--shadow-e3)]">
                    <div class="flex items-center gap-2.5">
                        <x-icon name="Sparkles" class="h-4 w-4 text-brand-2" />
                        <span class="text-[13px] font-medium text-ink">AI copilot &middot; online</span>
                    </div>
                </div>
            </div>
        </div>

        <div data-float-card data-delay="1.3" class="absolute bottom-[18%] right-[13%]">
            <div class="animate-float">
                <div class="glass rounded-2xl px-4 py-3 shadow-[var(--shadow-e3)]">
                    <div class="flex items-center gap-3">
                        <span class="grid h-9 w-9 place-items-center rounded-xl btn-brand text-white">
                            <x-icon name="Zap" class="h-4 w-4" />
                        </span>
                        <div>
                            <p class="font-display text-sm font-bold text-ink">99.98%</p>
                            <p class="text-[11px] text-ink-3">uptime this quarter</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ---------- content ---------- --}}
    <x-container class="relative z-10">
        <div data-hero-content class="mx-auto flex max-w-4xl flex-col items-center text-center">
            @if (! empty($hero['badge']))
                <div data-hero-item>
                    <span class="group inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-4 text-xs font-medium text-ink-2 backdrop-blur transition-colors hover:border-brand-2/40">
                        <span class="inline-flex items-center gap-1.5 rounded-full btn-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                            <x-icon name="Sparkles" class="h-3 w-3" />
                            New
                        </span>
                        <span class="uppercase tracking-[0.14em]">{{ $hero['badge'] }}</span>
                    </span>
                </div>
            @endif

            @if (! empty($hero['titleLead']) || ! empty($hero['titleHighlight']))
                <h1 data-hero-item class="mt-8 text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] min-[390px]:text-5xl sm:text-6xl md:text-7xl">
                    @if (! empty($hero['titleLead']))
                        <span data-word-gradient="ink">
                            <span class="word-reveal is-in inline" data-text="{{ $hero['titleLead'] }}" data-delay="0.25"></span>
                        </span>
                    @endif
                    @if (! empty($hero['titleHighlight']))
                        <span class="relative" data-word-gradient="brand">
                            <span class="word-reveal is-in inline" data-text="{{ $hero['titleHighlight'] }}" data-delay="0.45"></span>
                            {{-- hand-drawn style underline sweep --}}
                            <span aria-hidden="true" class="title-sweep is-in absolute -bottom-1 left-0 block h-[3px] w-full rounded-full bg-linear-to-r from-brand-2 via-brand-3 to-transparent"></span>
                        </span>
                    @endif
                </h1>
            @endif

            @if (! empty($hero['subtitle']))
                <p data-hero-item class="mt-7 max-w-xl text-balance text-base leading-relaxed text-ink-2 sm:mt-8 sm:text-lg">
                    {{ $hero['subtitle'] }}
                </p>
            @endif

            @if ($showPrimary || $showSecondary)
                <div data-hero-item class="mt-10 flex w-full flex-col items-stretch gap-3 min-[390px]:w-auto min-[390px]:items-center sm:flex-row">
                    @if ($showPrimary)
                        <x-button
                            :href="$hero['primaryHref']"
                            size="lg"
                            magnetic
                            with-arrow
                            class="w-full shadow-[var(--shadow-brand-lg)] sm:w-auto"
                        >{{ $hero['primaryLabel'] }}</x-button>
                    @endif
                    @if ($showSecondary)
                        <x-button
                            :href="$hero['secondaryHref']"
                            size="lg"
                            variant="secondary"
                            class="w-full sm:w-auto"
                        >{{ $hero['secondaryLabel'] }}</x-button>
                    @endif
                </div>
            @endif

            {{-- ---------- trust bar ---------- --}}
            <div data-hero-item class="mt-12 flex flex-col items-center gap-5">
                <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
                    <x-avatar-stack :items="$faces" />
                    <span class="flex flex-col items-start">
                        <x-stars />
                        <span class="mt-0.5 text-xs text-ink-3">
                            Trusted by founders and product teams worldwide
                        </span>
                    </span>
                </div>

                <div class="flex flex-wrap items-center justify-center gap-2.5">
                    @foreach ($proof as $stat)
                        <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 backdrop-blur">
                            <span class="font-display text-sm font-bold text-ink">{{ $stat['value'] ?? '' }}{{ $stat['suffix'] ?? '' }}</span>
                            {{ $stat['label'] }}
                        </span>
                    @endforeach
                    <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 backdrop-blur">
                        <x-icon name="ShieldCheck" class="h-3.5 w-3.5 text-brand-3" />
                        Senior-led delivery
                    </span>
                </div>
            </div>
        </div>
    </x-container>

    {{-- ---------- scroll cue ---------- --}}
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-7 z-10 hidden justify-center md:flex">
        <span class="flex h-11 w-7 items-start justify-center rounded-full border border-white/15 pt-2">
            <x-icon name="ArrowDown" class="animate-scroll-cue h-3.5 w-3.5 text-ink-3" />
        </span>
    </div>
</section>
