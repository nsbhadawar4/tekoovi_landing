@extends('admin.layouts.app')

@section('title', 'Media library')

@section('body')
    <div class="flex min-h-screen flex-col">
        <header class="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
            <div class="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
                <div class="flex min-w-0 items-center gap-2.5">
                    <a
                        href="{{ route('admin.dashboard') }}"
                        aria-label="Back to the content studio"
                        class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.02] text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
                    >
                        <x-icon name="ArrowLeft" class="h-4 w-4" />
                    </a>
                    <div class="min-w-0">
                        <h1 class="truncate text-[15px] font-semibold text-ink md:text-lg">Media library</h1>
                        <p class="mt-0.5 hidden text-xs text-ink-3 sm:block">
                            Every image uploaded from the content forms, newest first.
                        </p>
                    </div>
                </div>

                <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <button
                        type="button"
                        data-optimize-images
                        title="Move inline images into the cached media store for faster page loads"
                        class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50 sm:px-3"
                    >
                        <x-icon name="Sparkles" class="h-4 w-4" />
                        <span data-optimize-label class="hidden sm:inline">Optimize images</span>
                    </button>
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" aria-label="Log out" class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3">
                            <x-icon name="LogOut" class="h-4 w-4" />
                            <span class="hidden sm:inline">Log out</span>
                        </button>
                    </form>
                </div>
            </div>
        </header>

        <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-5 sm:py-8 md:px-6">
            <div class="flex flex-col gap-1">
                <h2 class="text-base font-medium text-ink">
                    Images <span class="text-ink-3">({{ count($items) }})</span>
                </h2>
                <p class="text-xs text-ink-3">
                    Up to {{ round($maxBytes / 1024 / 1024, 1) }} MB each &middot;
                    {{ implode(', ', array_map(fn ($t) => strtoupper(str_replace('image/', '', $t)), $allowedTypes)) }}
                </p>
                <p class="mt-1 text-xs text-ink-3/80">
                    Deleting an image here does not clear it from any content still pointing at it —
                    check the section first.
                </p>
            </div>

            @if (count($items) === 0)
                <div class="card-hairline mt-6 rounded-2xl p-10 text-center">
                    <p class="font-display text-lg font-semibold text-ink">Nothing uploaded yet</p>
                    <p class="mt-2 text-sm text-ink-2">
                        Images land here as soon as you upload one from a content form.
                    </p>
                </div>
            @else
                <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    @foreach ($items as $item)
                        <div data-media-item class="card-hairline group relative overflow-hidden rounded-2xl">
                            <div class="relative aspect-[16/10] overflow-hidden border-b border-line bg-bg-2">
                                <img
                                    src="{{ $item['url'] }}"
                                    alt="Uploaded image {{ $item['id'] }}"
                                    loading="lazy"
                                    decoding="async"
                                    class="absolute inset-0 h-full w-full object-contain"
                                >
                            </div>
                            <div class="flex items-center justify-between gap-3 p-4">
                                <div class="min-w-0">
                                    <p class="truncate font-mono text-[11px] text-ink-3">{{ $item['id'] }}</p>
                                    <p class="mt-0.5 text-xs text-ink-2">
                                        {{ strtoupper(str_replace('image/', '', $item['contentType'])) }} &middot;
                                        {{ number_format($item['size'] / 1024, 0) }} KB
                                    </p>
                                </div>
                                <div class="flex shrink-0 gap-2">
                                    <a
                                        href="{{ $item['url'] }}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Open image"
                                        class="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/[0.02] text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
                                    >
                                        <x-icon name="ExternalLink" class="h-3.5 w-3.5" />
                                    </a>
                                    <button
                                        type="button"
                                        data-media-delete="{{ $item['id'] }}"
                                        aria-label="Delete image"
                                        class="grid h-8 w-8 place-items-center rounded-lg border border-red-500/30 bg-red-500/[0.04] text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        <x-icon name="Trash2" class="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>
@endsection
