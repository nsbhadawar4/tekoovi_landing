@props(['name', 'class' => 'h-4 w-4', 'fill' => 'none'])

{{--
  One Lucide icon.

  The React app rendered `<Icon className="h-4 w-4" />`; this is the same thing.
  Stroke, size and colour ride on the class attribute, and the paths come from
  config/lucide.php — extracted from the lucide package, so the drawing is
  identical to what the site shipped before.
--}}
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="{{ $fill }}"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    {{ $attributes->merge(['class' => $class]) }}
>{{ \App\Support\Icons::markup($name) }}</svg>
