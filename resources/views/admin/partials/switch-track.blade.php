{{-- The track + knob every switch in the panel is drawn with. --}}
<span data-switch-track aria-hidden="true" @class([
    'relative block h-4 w-7 rounded-full transition-colors',
    'bg-brand' => $on,
    'bg-white/15' => ! $on,
])>
    <span data-switch-knob @class([
        'absolute top-[3px] block h-2.5 w-2.5 rounded-full bg-white transition-[left] duration-200',
        'left-[14px]' => $on,
        'left-[3px]' => ! $on,
    ])></span>
</span>
