@props([
    'eyebrow',
    'title',
    'description' => null,
    'align' => 'center',
    'action' => null,
])

@php
    // Centring only makes sense without an action beside the text.
    $isCenter = $align === 'center' && ! $action;
@endphp

{{--
  Section header.

  `action` puts a control (a "view all" button, a carousel hint) opposite the
  text on wide screens and underneath it on phones — the layout that keeps a
  long page from reading as one column of centred text.
--}}
<div {{ $attributes->class([
    'flex flex-col gap-8',
    'md:flex-row md:items-end md:justify-between md:gap-12' => (bool) $action,
]) }}>
    <div @class([
        'flex flex-col gap-5',
        'items-center text-center' => $isCenter,
        'items-start text-left' => ! $isCenter,
    ])>
        <x-reveal>
            <x-badge>{{ $eyebrow }}</x-badge>
        </x-reveal>

        <x-reveal :delay="0.06">
            <h2 @class([
                'text-ink-gradient max-w-3xl text-balance text-[2rem] font-semibold leading-[1.06] tracking-[-0.02em] sm:text-4xl md:text-[2.9rem]',
                'mx-auto' => $isCenter,
            ])>{{ $title }}</h2>
        </x-reveal>

        @if ($description)
            <x-reveal :delay="0.12">
                <p @class([
                    'max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-2 sm:text-base md:text-lg',
                    'mx-auto' => $isCenter,
                ])>{{ $description }}</p>
            </x-reveal>
        @endif

        {{-- short brand rule under the heading block --}}
        <x-reveal :delay="0.16">
            <span aria-hidden="true" @class([
                'block h-px w-24 bg-linear-to-r from-brand-2 to-transparent' => ! $isCenter,
                'mx-auto block h-px w-24 bg-linear-to-r from-transparent via-brand-2 to-transparent' => $isCenter,
            ])></span>
        </x-reveal>
    </div>

    @if ($action)
        <div class="shrink-0">{{ $action }}</div>
    @endif
</div>
