@props([
    'href' => null,
    'external' => null,
    'variant' => 'primary',
    'size' => 'md',
    'magnetic' => false,
    'withArrow' => false,
    'type' => 'button',
])

@php
    $sizes = [
        'md' => 'h-11 px-6 text-sm',
        'lg' => 'h-14 px-8 text-[15px]',
    ];

    $variants = [
        'primary' => 'btn-brand text-white',
        'secondary' => 'glass text-ink hover:bg-white/[0.07] hover:border-white/15',
        'ghost' => 'text-ink-2 hover:text-ink',
    ];

    $classes = trim(implode(' ', [
        'group relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-300 will-change-transform',
        $sizes[$size] ?? $sizes['md'],
        $variants[$variant] ?? $variants['primary'],
    ]));

    // Several hrefs come straight from admin content, so an absolute URL opens
    // in a new tab unless the caller says otherwise.
    $leavesSite = $external ?? ($href !== null && preg_match('#^https?://#i', $href) === 1);
@endphp

@if ($href)
    <a
        href="{{ $href }}"
        @if ($leavesSite) target="_blank" rel="noopener noreferrer" @endif
        @if ($magnetic) data-magnetic @endif
        {{ $attributes->merge(['class' => $classes]) }}
    >
        <span class="relative z-10">{{ $slot }}</span>
        @if ($withArrow)
            <x-icon name="ArrowRight" class="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        @endif
    </a>
@else
    <button
        type="{{ $type }}"
        @if ($magnetic) data-magnetic @endif
        {{ $attributes->merge(['class' => $classes]) }}
    >
        <span class="relative z-10">{{ $slot }}</span>
        @if ($withArrow)
            <x-icon name="ArrowRight" class="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        @endif
    </button>
@endif
