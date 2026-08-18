{{--
  The two switch shapes the panel uses, kept together so the track and knob are
  drawn identically in both.

  `visibility` — off leaves the field (or the whole landing-page block) out of
                 the public page without touching the content, so switching it
                 back on restores everything as it was.
  `boolean`    — a plain on/off content value.

  Each expects: $name, $label, $on, and for visibility, $what ("field"/"section")
  and $attribute (the data- attribute the admin script binds to).
--}}

@php
    $what = $what ?? 'field';
    $attribute = $attribute ?? 'data-visibility-switch';
@endphp

@if (($kind ?? 'visibility') === 'visibility')
    <button
        type="button"
        role="switch"
        aria-checked="{{ $on ? 'true' : 'false' }}"
        aria-label="{{ $label }} — {{ $on ? 'shown on the site' : 'hidden from the site' }}"
        {{ $attribute }}="{{ $name }}"
        data-what="{{ $what }}"
        class="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-ink-3 transition-colors hover:text-ink-2"
    >
        <x-icon name="Eye" data-switch-eye @class(['h-3.5 w-3.5 text-brand-3', 'hidden' => ! $on]) />
        <x-icon name="EyeOff" data-switch-eye-off @class(['h-3.5 w-3.5', 'hidden' => $on]) />
        {{-- the word is the first thing to go when space runs out --}}
        <span data-switch-word @class(['hidden min-[380px]:inline', 'text-brand-3' => $on])>{{ $on ? 'Shown' : 'Hidden' }}</span>
        @include('admin.partials.switch-track', ['on' => $on])
    </button>
@else
    <button
        type="button"
        role="switch"
        aria-checked="{{ $on ? 'true' : 'false' }}"
        aria-label="{{ $label }}"
        data-boolean-switch="{{ $inputId }}"
        class="inline-flex shrink-0 items-center gap-2 text-[11px] font-medium text-ink-3 transition-colors hover:text-ink-2"
    >
        <span data-switch-word @class(['text-brand-3' => $on])>{{ $on ? 'On' : 'Off' }}</span>
        @include('admin.partials.switch-track', ['on' => $on])
    </button>
@endif
