@props(['items' => []])

{{--
  Overlapping monogram avatars — social proof next to the hero CTAs.
  Fed from real testimonial initials, so it never invents people.
--}}
@if (count($items) > 0)
    <span {{ $attributes->merge(['class' => 'flex items-center -space-x-2.5']) }}>
        @foreach ($items as $i => $item)
            <span
                title="{{ $item['name'] ?? '' }}"
                style="z-index: {{ count($items) - $i }}"
                class="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-linear-to-br from-brand-2 to-brand text-[11px] font-bold text-white shadow-[var(--shadow-e1)] ring-2 ring-bg"
            >{{ mb_strtoupper(mb_substr($item['initials'] ?? '', 0, 2)) }}</span>
        @endforeach
    </span>
@endif
