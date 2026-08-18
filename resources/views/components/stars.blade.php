@props(['count' => 5, 'size' => 'h-3.5 w-3.5'])

{{-- Five-star row used in the hero trust bar and on testimonials. --}}
<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-0.5']) }} aria-label="{{ $count }} out of 5 stars">
    @for ($i = 0; $i < $count; $i++)
        <x-icon name="Star" fill="currentColor" class="{{ $size }} text-amber-300" />
    @endfor
</span>
