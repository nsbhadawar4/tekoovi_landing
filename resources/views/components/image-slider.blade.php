@props(['images' => [], 'alt' => ''])

{{--
  Image carousel with prev/next, dots, keyboard arrows and a thumbnail strip.
  The port of components/ui/image-slider.tsx; app.js drives the track.
--}}
@php $count = count($images); @endphp

@if ($count > 0)
    <div data-slider="{{ $count }}" class="flex flex-col gap-3">
        <div class="rounded-[26px] bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_45%,rgba(138,92,255,0.28))] p-px">
            <div
                data-slider-stage
                tabindex="0"
                class="group relative overflow-hidden rounded-[25px] bg-bg-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
            >
                {{-- track --}}
                <div data-slider-track class="flex transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
                    @foreach ($images as $i => $src)
                        <div class="relative aspect-[16/9] w-full shrink-0 basis-full">
                            {{-- blurred fill so any aspect ratio sits gap-free --}}
                            <div aria-hidden="true" class="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125" style="background-image: url('{{ $src }}')"></div>
                            <img
                                src="{{ $src }}"
                                alt="{{ $alt }} — {{ $i + 1 }}"
                                loading="{{ $i === 0 ? 'eager' : 'lazy' }}"
                                decoding="async"
                                class="absolute inset-0 h-full w-full object-contain"
                            >
                        </div>
                    @endforeach
                </div>

                @if ($count > 1)
                    {{-- controls --}}
                    <button
                        type="button"
                        data-slider-prev
                        aria-label="Previous image"
                        class="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/70 group-hover:opacity-100"
                    >
                        <x-icon name="ChevronLeft" class="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        data-slider-next
                        aria-label="Next image"
                        class="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/70 group-hover:opacity-100"
                    >
                        <x-icon name="ChevronRight" class="h-5 w-5" />
                    </button>

                    {{-- counter --}}
                    <span data-slider-counter class="absolute right-4 top-4 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                        1 / {{ $count }}
                    </span>

                    {{-- dots --}}
                    <div class="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                        @foreach ($images as $i => $src)
                            <button type="button" data-slider-dot aria-label="Go to image {{ $i + 1 }}" class="h-1.5 w-1.5 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70"></button>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>

        {{-- thumbnail strip --}}
        @if ($count > 1)
            <div class="flex gap-2.5 overflow-x-auto pb-1">
                @foreach ($images as $i => $src)
                    <button
                        type="button"
                        data-slider-thumb
                        aria-label="Show image {{ $i + 1 }}"
                        class="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 opacity-55 transition-all duration-300 hover:opacity-100"
                    >
                        <img src="{{ $src }}" alt="{{ $alt }} thumbnail {{ $i + 1 }}" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover">
                    </button>
                @endforeach
            </div>
        @endif
    </div>
@endif
