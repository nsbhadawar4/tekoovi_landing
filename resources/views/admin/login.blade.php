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

            {{-- The reveal button sits outside the label so clicking it toggles
                 visibility instead of being swallowed as a label activation. --}}
            <div class="mt-4">
                <label for="password" class="block text-xs font-medium text-ink-3">Password</label>

                <div class="relative mt-2">
                    <input
                        id="password"
                        type="password"
                        name="password"
                        autocomplete="current-password"
                        class="w-full rounded-xl border border-line bg-bg/60 py-2.5 pl-3.5 pr-11 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring"
                        placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    >

                    <button
                        type="button"
                        data-password-toggle
                        aria-controls="password"
                        aria-pressed="false"
                        aria-label="Show password"
                        class="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-ink-3 transition-colors hover:text-ink focus-visible:focus-ring"
                    >
                        <x-icon name="Eye" class="h-4 w-4" data-password-icon="show" />
                        <x-icon name="EyeOff" class="hidden h-4 w-4" data-password-icon="hide" />
                    </button>
                </div>
            </div>

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
