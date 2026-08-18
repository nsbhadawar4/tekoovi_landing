@props([
    'label',
    'slideClass' => 'basis-full',
    'autoPlay' => false,
    'intervalMs' => 5600,
    'showArrows' => true,
    'showDots' => true,
    'showProgress' => false,
    'railClass' => '',
])

{{--
  Scroll-snap carousel — the port of components/ui/carousel.tsx.

  Built on real overflow scrolling rather than a transformed track, so touch
  swipe, trackpad gestures, keyboard and screen readers all work natively; the
  arrows, dots and pointer drag in app.js just script the same scroll position.

  Slides come in as <li> elements from the caller, each carrying $slideClass.
--}}
<div
    data-carousel
    @if ($autoPlay) data-autoplay="1" data-interval="{{ $intervalMs }}" @endif
    role="region"
    aria-roledescription="carousel"
    aria-label="{{ $label }}"
    {{ $attributes->merge(['class' => 'relative']) }}
>
    <ul
        data-carousel-rail
        tabindex="0"
        aria-label="{{ $label }} — use the arrow keys to browse"
        class="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-brand-2/50 active:cursor-grabbing sm:gap-6 {{ $railClass }}"
    >
        {{ $slot }}
    </ul>

    @if ($showArrows || $showDots || $showProgress)
        <div data-carousel-controls class="mt-7 hidden items-center justify-between gap-6">
            <div data-carousel-dots class="flex items-center gap-2.5"></div>

            @if ($showProgress)
                <div class="hidden h-px flex-1 bg-line sm:block">
                    <div data-carousel-progress class="h-px bg-linear-to-r from-brand-2 to-brand-3 transition-[width] duration-500 ease-out-expo" style="width: 0%"></div>
                </div>
            @endif

            @if ($showArrows)
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        data-carousel-prev
                        aria-label="Previous slide"
                        class="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.03] text-ink-2 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/50 hover:bg-brand/10 hover:text-ink hover:shadow-[var(--shadow-brand)] active:translate-y-0"
                    >
                        <x-icon name="ChevronLeft" class="h-4.5 w-4.5" />
                    </button>
                    <button
                        type="button"
                        data-carousel-next
                        aria-label="Next slide"
                        class="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.03] text-ink-2 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/50 hover:bg-brand/10 hover:text-ink hover:shadow-[var(--shadow-brand)] active:translate-y-0"
                    >
                        <x-icon name="ChevronRight" class="h-4.5 w-4.5" />
                    </button>
                </div>
            @endif
        </div>
    @endif
</div>
