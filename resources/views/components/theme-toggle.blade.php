{{--
  Sun/moon button that flips the site between light and dark.

  The active theme lives on <html data-theme>; the no-flash script in the layout
  sets it before first paint, and app.js swaps the glyph and remembers the
  choice in localStorage.
--}}
<button
    type="button"
    data-theme-toggle
    data-storage-key="{{ \App\Support\Site::THEME_STORAGE_KEY }}"
    aria-label="Switch theme"
    {{ $attributes->merge(['class' => 'relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]']) }}
>
    <x-icon name="Moon" data-theme-moon class="h-[18px] w-[18px]" />
    <x-icon name="Sun" data-theme-sun class="hidden h-[18px] w-[18px] text-brand-3" />
</button>
