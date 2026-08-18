@php $latest = array_slice(array_values($content['blogs'] ?? []), 0, 3); @endphp

{{-- Landing-page teaser: the latest posts + a link to the full blog. --}}
@if (count($latest) > 0)
    <x-section id="blog" class="relative overflow-hidden bg-bg-2">
        <div aria-hidden="true" class="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-60"></div>

        <x-container class="relative">
            <x-section-heading
                align="left"
                eyebrow="Blog"
                title="Insights from the studio"
                description="Field notes on design, engineering and shipping AI products — written by the people who build them."
            >
                <x-slot:action>
                    <x-button href="/blog" variant="secondary" with-arrow>Read the blog</x-button>
                </x-slot:action>
            </x-section-heading>

            <div data-reveal-group data-stagger="0.07" class="mt-12 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                @foreach ($latest as $blog)
                    <div data-reveal-item class="h-full">
                        <x-blog-card :blog="$blog" />
                    </div>
                @endforeach
            </div>
        </x-container>
    </x-section>
@endif
