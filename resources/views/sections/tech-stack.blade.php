@php
    // A hidden (or empty) name leaves nothing to put in a chip.
    $chips = array_values(array_filter($content['techStack'] ?? [], fn ($t) => ! empty($t['name'])));
    $mid = (int) ceil(count($chips) / 2);
    $firstRow = array_slice($chips, 0, $mid);
    $secondRow = array_slice($chips, $mid);
@endphp

<x-section id="stack" class="relative overflow-hidden bg-bg-2">
    {{-- ambient glow behind the conveyor --}}
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 w-3/4 max-w-4xl -translate-y-1/4 rounded-full bg-brand/10 blur-[130px]"></div>
    <div aria-hidden="true" class="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-50"></div>

    <x-container class="relative">
        <x-section-heading
            eyebrow="Technology"
            title="A modern stack chosen for longevity"
            description="Battle-tested tools we reach for again and again — selected for scale, speed and a decade of maintainability, not hype."
        />
    </x-container>

    <div class="relative mt-14 flex flex-col gap-4 sm:gap-5">
        <x-marquee>
            @foreach ($firstRow as $tech)
                @include('sections.partials.tech-chip', ['name' => $tech['name']])
            @endforeach
        </x-marquee>
        <x-marquee reverse>
            @foreach ($secondRow as $tech)
                @include('sections.partials.tech-chip', ['name' => $tech['name']])
            @endforeach
        </x-marquee>
    </div>
</x-section>
