<div class="group card-lux relative flex items-center gap-3.5 overflow-hidden rounded-2xl px-5 py-3.5 transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-brand-2/40">
    <span aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_circle_at_20%_120%,rgba(138,92,255,0.22),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
    <span class="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] font-display text-sm font-bold text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white group-hover:shadow-[var(--shadow-brand)]">
        {{ mb_substr($name, 0, 1) }}
    </span>
    <span class="relative whitespace-nowrap font-display text-base font-semibold text-ink">{{ $name }}</span>
</div>
