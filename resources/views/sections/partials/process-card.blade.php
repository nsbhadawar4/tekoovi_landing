@php $number = $stage['step'] ?: str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT); @endphp

<article class="group card-lux lift sheen relative h-full overflow-hidden rounded-[22px] p-6 sm:p-7">
    <div aria-hidden="true" class="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>

    {{-- oversized ghost number --}}
    <span aria-hidden="true" class="pointer-events-none absolute -bottom-6 right-2 font-display text-[5.5rem] font-bold leading-none text-white/[0.04] transition-colors duration-500 group-hover:text-brand-3/15">
        {{ $number }}
    </span>

    <div class="relative flex items-center gap-3">
        @if (! empty($stage['step']))
            <span class="grid h-9 min-w-9 place-items-center rounded-xl border border-brand-2/30 bg-brand/10 px-2 font-display text-sm font-bold text-brand-3 transition-all duration-500 group-hover:border-transparent group-hover:bg-brand group-hover:text-white">
                {{ $stage['step'] }}
            </span>
        @endif
        <span aria-hidden="true" class="h-px flex-1 bg-linear-to-r from-white/15 to-transparent"></span>
    </div>

    @if (! empty($stage['title']))
        <h3 class="relative mt-5 font-display text-lg font-semibold text-ink transition-colors duration-300 group-hover:text-brand-3">
            {{ $stage['title'] }}
        </h3>
    @endif
    @if (! empty($stage['description']))
        <p class="relative mt-2.5 text-sm leading-relaxed text-ink-2">{{ $stage['description'] }}</p>
    @endif
</article>
