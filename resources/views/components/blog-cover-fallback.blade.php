@props(['title' => ''])

{{-- Stands in for a missing cover: brand wash, grid and the article initial. --}}
<div class="absolute inset-0">
    <div class="absolute inset-0 bg-[linear-gradient(140deg,rgba(108,59,255,0.35),rgba(20,21,31,0.9))]"></div>
    <div class="grid-lines absolute inset-0 opacity-40"></div>
    <span class="absolute inset-0 grid place-items-center font-display text-[5rem] font-bold leading-none text-white/[0.08]">
        {{ mb_substr($title, 0, 1) }}
    </span>
</div>
