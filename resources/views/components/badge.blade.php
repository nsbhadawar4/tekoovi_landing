@props(['dot' => true])

<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-ink-2 backdrop-blur']) }}>
    @if ($dot)
        <span class="h-1.5 w-1.5 rounded-full bg-brand-2 shadow-[0_0_10px_2px_rgba(138,92,255,0.75)]"></span>
    @endif
    {{ $slot }}
</span>
