@props(['blog'])

@php
    use App\Support\Sections;
    use App\Support\Site;

    // "Tekoovi" stands in for a blank author, so an author switched off in the
    // admin has to be checked on the record itself.
    $showAuthor = ! Sections::isHidden($blog, 'author');
    $author = $blog['author'] ?: Site::NAME;
@endphp

<a href="{{ Site::blogHref($blog) }}" class="group card-lux lift sheen relative flex h-full flex-col overflow-hidden rounded-[24px]">
    {{-- cover --}}
    <div class="relative aspect-[16/10] overflow-hidden">
        @if (! empty($blog['coverImage']))
            <img
                src="{{ $blog['coverImage'] }}"
                alt="{{ $blog['title'] ?? '' }}"
                loading="lazy"
                decoding="async"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.09]"
            >
        @else
            <x-blog-cover-fallback :title="$blog['title'] ?? ''" />
        @endif
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"></div>

        @if (! empty($blog['category']))
            <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-brand-3 backdrop-blur">
                {{ $blog['category'] }}
            </span>
        @endif
        @if (! empty($blog['readTime']))
            <span class="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                <x-icon name="Clock" class="h-3 w-3" />
                {{ $blog['readTime'] }}
            </span>
        @endif
    </div>

    {{-- body --}}
    <div class="flex flex-1 flex-col p-6">
        @if (! empty($blog['date']))
            <span class="inline-flex items-center gap-1.5 text-xs text-ink-3">
                <x-icon name="CalendarDays" class="h-3.5 w-3.5" />
                {{ $blog['date'] }}
            </span>
        @endif

        {{-- title with an underline that draws itself in on hover --}}
        @if (! empty($blog['title']))
            <h3 class="link-underline mt-3 self-start pb-1 font-display text-xl font-semibold leading-snug text-ink">{{ $blog['title'] }}</h3>
        @endif

        @if (! empty($blog['excerpt']))
            <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-2">{{ $blog['excerpt'] }}</p>
        @endif

        <div class="mt-auto flex items-center justify-between pt-6">
            @if ($showAuthor)
                <span class="inline-flex items-center gap-2">
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/15 font-display text-[11px] font-bold text-brand-3 ring-1 ring-brand-2/30">
                        {{ mb_strtoupper(mb_substr($author, 0, 1)) }}
                    </span>
                    <span class="text-xs font-medium text-ink-3">{{ $author }}</span>
                </span>
            @else
                <span></span>
            @endif
            <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors group-hover:text-brand-3">
                Read
                <x-icon name="ArrowUpRight" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
        </div>
    </div>
</a>
