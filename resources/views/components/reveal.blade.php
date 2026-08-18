@props(['delay' => 0, 'y' => 22, 'as' => 'div'])

{{--
  The scroll-in wrapper `<Reveal>` was in React. app.js adds `.is-in` when the
  element enters the viewport; the curve, duration and travel live in CSS.
--}}
<{{ $as }}
    data-reveal
    style="--reveal-delay: {{ $delay }}s; --reveal-y: {{ $y }}px"
    {{ $attributes }}
>{{ $slot }}</{{ $as }}>
