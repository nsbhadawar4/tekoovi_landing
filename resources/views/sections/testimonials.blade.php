@php
    $quotes = array_values(array_filter(
        $content['testimonials'] ?? [],
        fn ($t) => ! empty($t['quote']) || ! empty($t['name']) || ! empty($t['role']) || ! empty($t['initials']),
    ));
@endphp

{{--
  Testimonials as an auto-advancing rail.

  Every quote gets the same generous card instead of one hero quote and a row of
  small ones — it reads as a body of proof, and nothing is buried.
--}}
@if (count($quotes) > 0)
    <x-section id="testimonials" class="relative overflow-hidden">
        <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 w-2/3 max-w-3xl rounded-full bg-brand/10 blur-[130px]"></div>

        <x-container class="relative">
            <x-section-heading
                align="left"
                eyebrow="Testimonials"
                title="Founders don’t hold back about us"
                description="The partnerships we're proudest of — in the words of the people who lived them."
            >
                <x-slot:action>
                    <span class="hidden items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3 md:inline-flex">
                        <x-stars />
                        <span class="text-sm text-ink-2">
                            <span class="font-semibold text-ink">5.0</span> average from
                            {{ count($quotes) }} client{{ count($quotes) === 1 ? '' : 's' }}
                        </span>
                    </span>
                </x-slot:action>
            </x-section-heading>

            <x-reveal class="mt-12 sm:mt-14">
                <x-carousel label="Client testimonials" auto-play :interval-ms="6500" show-progress>
                    @foreach ($quotes as $i => $t)
                        <li aria-roledescription="slide" aria-label="{{ $i + 1 }} of {{ count($quotes) }}" class="shrink-0 snap-start basis-full sm:basis-[62%] lg:basis-[42%]">
                            <figure class="card-lux border-glow group relative flex h-full flex-col gap-6 overflow-hidden rounded-[26px] p-7 sm:p-9">
                                {{-- watermark quote --}}
                                <x-icon name="Quote" class="pointer-events-none absolute -right-4 -top-3 h-28 w-28 text-white/[0.04] transition-colors duration-500 group-hover:text-brand-3/15" />
                                <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(360px_circle_at_20%_0%,rgba(138,92,255,0.14),transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                                <div class="relative flex items-center gap-3">
                                    <x-stars />
                                    <span class="text-xs font-medium uppercase tracking-[0.14em] text-ink-3">Verified client</span>
                                </div>

                                @if (! empty($t['quote']))
                                    <blockquote class="relative flex-1 text-pretty font-display text-lg font-medium leading-relaxed text-ink sm:text-xl">
                                        &ldquo;{{ $t['quote'] }}&rdquo;
                                    </blockquote>
                                @endif

                                @if (! empty($t['initials']) || ! empty($t['name']) || ! empty($t['role']))
                                    <figcaption class="relative flex items-center gap-3.5 border-t border-line pt-6">
                                        @if (! empty($t['initials']))
                                            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-brand text-sm font-bold text-white">
                                                {{ $t['initials'] }}
                                            </span>
                                        @endif
                                        <span class="min-w-0">
                                            @if (! empty($t['name']))
                                                <span class="block truncate text-sm font-semibold text-ink">{{ $t['name'] }}</span>
                                            @endif
                                            @if (! empty($t['role']))
                                                <span class="block truncate text-xs text-ink-3">{{ $t['role'] }}</span>
                                            @endif
                                        </span>
                                    </figcaption>
                                @endif
                            </figure>
                        </li>
                    @endforeach
                </x-carousel>
            </x-reveal>
        </x-container>
    </x-section>
@endif
