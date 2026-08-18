@props(['reverse' => false, 'slow' => false])

@php
    $speed = $reverse ? 'animate-marquee-rev' : ($slow ? 'animate-marquee-slow' : 'animate-marquee');
@endphp

<div {{ $attributes->merge(['class' => 'mask-fade-x group flex w-full overflow-hidden']) }}>
    <div class="flex shrink-0 items-center group-hover:[animation-play-state:paused] {{ $speed }}">
        <div class="flex shrink-0 items-center gap-4 pr-4">{{ $slot }}</div>
        {{-- The duplicate is what makes the -50% translate loop seamlessly. --}}
        <div aria-hidden="true" class="flex shrink-0 items-center gap-4 pr-4">{{ $slot }}</div>
    </div>
</div>
