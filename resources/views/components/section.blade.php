@props(['id' => null])

<section @if ($id) id="{{ $id }}" @endif {{ $attributes->merge(['class' => 'relative py-20 sm:py-24 md:py-28 lg:py-36']) }}>
    {{ $slot }}
</section>
