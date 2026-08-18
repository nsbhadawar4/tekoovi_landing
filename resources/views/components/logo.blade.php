@props(['logoImage' => null, 'showWordmark' => true])

@php $image = trim((string) $logoImage); @endphp

@if ($image !== '')
    <span
        role="img"
        aria-label="{{ \App\Support\Site::NAME }}"
        style="background-image: url('{{ $image }}'); aspect-ratio: 3"
        {{ $attributes->merge(['class' => 'inline-block h-9 bg-contain bg-left bg-no-repeat']) }}
    ></span>
@else
    <span {{ $attributes->merge(['class' => 'inline-flex items-center gap-2.5']) }}>
        <span class="relative grid h-8 w-8 place-items-center rounded-[9px] btn-brand">
            <span class="font-display text-[15px] font-bold leading-none text-white">T</span>
        </span>
        @if ($showWordmark)
            <span class="font-display text-[17px] font-semibold tracking-tight text-ink">{{ \App\Support\Site::NAME }}</span>
        @endif
    </span>
@endif
