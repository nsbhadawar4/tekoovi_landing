@extends('layouts.app')

@php
    use App\Support\Site;

    $clauseSlug = fn (string $heading) => Site::slugify($heading, 'clause');

    // A clause whose heading is switched off in the admin has nothing to list in
    // the contents rail, but its body still belongs on the page.
    $indexed = array_values(array_filter($clauses, fn ($c) => ! empty($c['heading'])));
    $email = $content['contact']['email'] ?? '';
@endphp

@section('content')
    {{-- ------------------------- header ------------------------- --}}
    <section class="relative overflow-hidden pt-36 pb-16 md:pt-44 md:pb-20">
        <div aria-hidden="true" class="grid-lines mask-radial-fade pointer-events-none absolute inset-0"></div>
        <div aria-hidden="true" class="pointer-events-none absolute -top-40 left-1/2 h-96 w-[70%] -translate-x-1/2 rounded-full bg-brand/12 blur-[140px]"></div>
        <x-container class="relative">
            <div class="max-w-3xl">
                <x-reveal>
                    <x-badge>{{ $eyebrow }}</x-badge>
                </x-reveal>
                @if (! empty($legal['title']))
                    <x-reveal :delay="0.06">
                        <h1 class="text-ink-gradient mt-6 text-4xl font-semibold leading-[1.05] md:text-6xl">{{ $legal['title'] }}</h1>
                    </x-reveal>
                @endif
                @if (! empty($legal['intro']))
                    <x-reveal :delay="0.12">
                        <p class="mt-6 max-w-2xl text-base leading-relaxed text-ink-2 md:text-lg">{{ $legal['intro'] }}</p>
                    </x-reveal>
                @endif
                @if (! empty($legal['updated']))
                    <x-reveal :delay="0.18">
                        <span class="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-3">
                            <x-icon name="CalendarDays" class="h-3.5 w-3.5" />
                            Last updated {{ $legal['updated'] }}
                        </span>
                    </x-reveal>
                @endif
            </div>
        </x-container>
    </section>

    {{-- -------------------------- body -------------------------- --}}
    <x-container class="relative pb-24 md:pb-32">
        <div class="grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
            {{-- Sticky clause index that highlights whichever clause is in view. --}}
            <aside class="hidden lg:block">
                <div class="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                    <nav data-legal-toc aria-label="On this page" class="flex flex-col gap-1">
                        <p class="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">On this page</p>
                        @foreach ($indexed as $i => $clause)
                            <a
                                href="#{{ $clauseSlug($clause['heading']) }}"
                                class="group flex items-start gap-3 rounded-lg px-3 py-2 text-sm text-ink-3 transition-colors hover:bg-white/[0.03] hover:text-ink-2"
                            >
                                <span data-toc-index class="mt-px shrink-0 font-mono text-[11px] tabular-nums text-ink-3/60 transition-colors group-hover:text-ink-3">
                                    {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}
                                </span>
                                <span class="leading-snug">{{ $clause['heading'] }}</span>
                            </a>
                        @endforeach
                    </nav>
                </div>
            </aside>

            <article class="min-w-0">
                @if (count($clauses) === 0)
                    <p class="text-sm text-ink-3">This policy is being updated. Please check back shortly.</p>
                @else
                    <div class="flex flex-col gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02]">
                        @foreach ($clauses as $i => $clause)
                            <section
                                @if (! empty($clause['heading'])) id="{{ $clauseSlug($clause['heading']) }}" @endif
                                class="scroll-mt-28 border-b border-white/[0.06] p-6 last:border-b-0 md:p-9"
                            >
                                @if (! empty($clause['heading']))
                                    <div class="flex items-baseline gap-4">
                                        <span class="font-mono text-xs tabular-nums text-brand-3/70">{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span>
                                        <h2 class="text-xl font-semibold text-ink md:text-2xl">{{ $clause['heading'] }}</h2>
                                    </div>
                                @endif
                                @if (! empty($clause['body']))
                                    {{-- Clause bodies are authored in the admin as plain text: a
                                         blank line starts a new paragraph, and a line beginning
                                         with "- " becomes a bullet. --}}
                                    <div class="mt-4 flex flex-col gap-4 md:pl-10">
                                        @foreach (Site::richText($clause['body']) as $block)
                                            @if ($block['type'] === 'list')
                                                <ul class="flex flex-col gap-2.5">
                                                    @foreach ($block['items'] as $item)
                                                        <li class="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                                                            <span aria-hidden="true" class="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-3/70"></span>
                                                            <span>{{ $item }}</span>
                                                        </li>
                                                    @endforeach
                                                </ul>
                                            @else
                                                <p class="text-[15px] leading-relaxed text-ink-2">{{ $block['text'] }}</p>
                                            @endif
                                        @endforeach
                                    </div>
                                @endif
                            </section>
                        @endforeach
                    </div>
                @endif

                {{-- questions CTA — nothing to offer without an email address --}}
                @if ($email)
                    <div class="mt-10 rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(138,92,255,0.12),rgba(255,255,255,0.02))] p-6 md:p-8">
                        <h3 class="text-lg font-semibold text-ink">Questions about this page?</h3>
                        <p class="mt-2 max-w-lg text-sm leading-relaxed text-ink-2">
                            A real person reads every message. Reach out and we&rsquo;ll get back to you.
                        </p>
                        <a
                            href="mailto:{{ $email }}"
                            class="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                        >
                            <x-icon name="Mail" class="h-4 w-4" />
                            {{ $email }}
                        </a>
                    </div>
                @endif
            </article>
        </div>
    </x-container>
@endsection
