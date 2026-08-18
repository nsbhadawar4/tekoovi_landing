@extends('admin.layouts.app')

@section('title', 'Sign in')

@section('body')
    <div class="grid min-h-screen place-items-center px-4 py-8 sm:px-6">
        <form method="POST" action="{{ route('admin.login.attempt') }}" class="card-elevated w-full max-w-sm rounded-3xl p-6 sm:p-8">
            @csrf

            <div class="flex items-center gap-3">
                <span class="grid h-11 w-11 place-items-center rounded-xl btn-brand font-display text-lg font-bold text-white">T</span>
                <div>
                    <h1 class="font-display text-xl font-semibold text-ink">{{ \App\Support\Site::NAME }} Admin</h1>
                    <p class="text-xs text-ink-3">Content management</p>
                </div>
            </div>

            <p class="mt-6 text-sm text-ink-2">Sign in to manage your landing page content.</p>

            <label class="mt-6 block text-xs font-medium text-ink-3">
                Email
                <input
                    type="email"
                    name="email"
                    value="{{ old('email') }}"
                    autofocus
                    autocomplete="email"
                    class="mt-2 w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring"
                    placeholder="you@example.com"
                >
            </label>

            <label class="mt-4 block text-xs font-medium text-ink-3">
                Password
                <input
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    class="mt-2 w-full rounded-xl border border-line bg-bg/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                >
            </label>

            @error('email')
                <p class="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ $message }}</p>
            @enderror

            {{-- Without credentials in the environment nobody can sign in, and a
                 silent "wrong password" would send the operator hunting. --}}
            @unless ($configured)
                <p class="mt-4 rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
                    No admin credentials are configured. Set <code>ADMIN_EMAIL</code> and
                    <code>ADMIN_PASSWORD_HASH</code> in your <code>.env</code>, then reload.
                </p>
            @endunless

            <button
                type="submit"
                class="mt-6 w-full rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50"
            >
                Sign in
            </button>
        </form>
    </div>
@endsection
