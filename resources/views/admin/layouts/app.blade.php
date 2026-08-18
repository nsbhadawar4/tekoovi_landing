<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#08090F">

    <title>@yield('title', 'Admin') · {{ \App\Support\Site::NAME }}</title>

    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">

    @vite(['resources/css/app.css', 'resources/js/admin.js'])
</head>
<body class="min-h-screen antialiased">
    <div class="relative min-h-screen bg-bg text-ink">
        {{-- ambient backdrop --}}
        <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div class="absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]"></div>
            <div class="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_30%,transparent_75%)]"></div>
        </div>

        @yield('body')
    </div>

    {{-- The admin script posts to these; keeping them in one place means no URL
         is hard-coded in JavaScript. --}}
    @php
        $adminRoutes = [
            'blocks' => route('admin.blocks.toggle'),
            'media' => url('admin/media'),
            'mediaStore' => route('admin.media.store'),
            'mediaMigrate' => route('admin.media.migrate'),
            'login' => route('admin.login'),
        ];
    @endphp
    <script type="application/json" data-admin-routes>@json($adminRoutes, JSON_UNESCAPED_SLASHES)</script>

    {{-- toast notifications --}}
    <div data-toast-stack class="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-xs">
        @if (session('toast'))
            @php $toast = session('toast'); @endphp
            <div data-toast @class([
                'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur',
                'border-emerald-500/30 bg-emerald-500/10' => $toast['type'] === 'success',
                'border-red-500/30 bg-red-500/10' => $toast['type'] !== 'success',
            ])>
                @if ($toast['type'] === 'success')
                    <x-icon name="CheckCircle2" class="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                @else
                    <x-icon name="CircleAlert" class="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                @endif
                <p class="flex-1 text-sm text-ink">{{ $toast['message'] }}</p>
            </div>
        @endif
    </div>

    @yield('dialogs')
</body>
</html>
