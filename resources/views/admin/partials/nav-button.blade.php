@php $target = $href ?? route('admin.section', $key); @endphp

{{-- One entry in the sidebar / mobile section sheet. --}}
<a
    href="{{ $target }}"
    title="{{ $item['onPage'] }}"
    @class([
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
        'bg-brand/15 text-ink ring-1 ring-inset ring-brand/25' => $active,
        'text-ink-3 hover:bg-white/[0.04] hover:text-ink' => ! $active,
    ])
>
    <x-icon :name="$item['icon']" @class(['h-4 w-4 shrink-0', 'text-brand-3' => $active]) />
    <span class="flex min-w-0 flex-col">
        <span class="truncate">{{ $item['label'] }}</span>
        <span @class([
            'truncate text-[10px] font-normal',
            'text-brand-3/70' => $active,
            'text-ink-3/70' => ! $active,
        ])>{{ $item['onPage'] }}</span>
    </span>
</a>
