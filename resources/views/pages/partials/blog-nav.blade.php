@php
    use App\Support\Site;
    $isNext = $direction === 'next';
@endphp

@if (! $blog)
    <div class="hidden sm:block"></div>
@else
    <a
        href="{{ Site::blogHref($blog) }}"
        @class([
            'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0)_60%)] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/40',
            'sm:flex-row-reverse sm:text-right' => $isNext,
        ])
    >
        {{-- cover thumb --}}
        <div class="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10">
            @if (! empty($blog['coverImage']))
                <img src="{{ $blog['coverImage'] }}" alt="{{ $blog['title'] ?? '' }}" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110">
            @else
                <div class="absolute inset-0 bg-[linear-gradient(140deg,rgba(108,59,255,0.4),rgba(20,21,31,0.9))]"></div>
            @endif
        </div>

        <span class="min-w-0 flex-1">
            <span @class([
                'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-3',
                'sm:flex-row-reverse' => $isNext,
            ])>
                @if ($isNext)
                    Next <x-icon name="ArrowRight" class="h-3.5 w-3.5" />
                @else
                    <x-icon name="ArrowLeft" class="h-3.5 w-3.5" /> Previous
                @endif
            </span>
            @if (! empty($blog['title']))
                <span class="mt-1 block truncate font-display text-base font-semibold text-ink transition-colors group-hover:text-brand-3">{{ $blog['title'] }}</span>
            @endif
        </span>

        <x-icon name="ArrowUpRight" @class([
            'hidden h-4 w-4 shrink-0 text-ink-3 transition-all duration-300 group-hover:text-brand-3 sm:block',
            'sm:order-first' => $isNext,
        ]) />
    </a>
@endif
