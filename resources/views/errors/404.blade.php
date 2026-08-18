@php
    // Errors are rendered outside the page controllers, so the layout's content
    // is fetched here. A database hiccup must not turn a 404 into a 500, so a
    // failed read falls back to an empty document and the page still renders.
    try {
        $content = app(\App\Services\ContentService::class)->publicContent();
    } catch (\Throwable $e) {
        $content = [];
    }

    $meta = [
        'title' => 'Page not found · '.\App\Support\Site::NAME,
        'description' => 'The page you were looking for could not be found.',
        'noindex' => true,
    ];

    $calendly = $content['contact']['calendly'] ?? '';
@endphp

@extends('layouts.app')

@section('content')
    <section class="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6">
        <x-aurora />
        <x-grid-backdrop />
        <div class="relative z-10 flex flex-col items-center text-center">
            <x-badge>Error 404</x-badge>
            <h1 class="text-ink-gradient mt-6 font-display text-[26vw] font-bold leading-none tracking-tighter sm:text-[180px]">404</h1>
            <p class="mt-2 max-w-md text-balance text-lg text-ink-2">
                This page drifted off the roadmap. Let&rsquo;s get you back to something that ships.
            </p>
            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
                <x-button href="/" size="lg" magnetic with-arrow>Back to home</x-button>
                @if ($calendly)
                    <x-button :href="$calendly" size="lg" variant="secondary">Book a call</x-button>
                @endif
            </div>
        </div>
    </section>
@endsection
