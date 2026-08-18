@props([
    'contact' => [],
    'socials' => [],
    'services' => [],
    'logoImage' => null,
    'pageSections' => [],
])

@php
    use App\Support\Sections;
    use App\Support\Site;

    // Footer links point at landing-page anchors, so a section switched off in
    // the admin takes its links with it rather than leaving a dead jump.
    $navLinks = Site::visibleNavLinks($pageSections);
    $showWorkLink = Sections::isBlockVisible($pageSections, 'work');
    $showServices = Sections::isBlockVisible($pageSections, 'services');

    $socialLinks = array_filter($socials, fn ($s) => ! empty($s['label']) && ! empty($s['href']));
    $serviceLinks = array_slice(array_filter($services, fn ($s) => ! empty($s['title'])), 0, 6);

    $email = $contact['email'] ?? '';
    $whatsapp = $contact['whatsapp'] ?? '';
    $calendly = $contact['calendly'] ?? '';
@endphp

<footer class="relative overflow-hidden border-t border-line bg-bg-2 pt-16 md:pt-20">
    <div aria-hidden="true" class="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60%] -translate-x-1/2 rounded-full bg-brand/10 blur-[130px]"></div>
    <div aria-hidden="true" class="dot-grid mask-radial-fade pointer-events-none absolute inset-0 opacity-50"></div>
    <span aria-hidden="true" class="pointer-events-none absolute inset-x-24 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></span>

    <x-container class="relative">
        <div class="grid gap-10 pb-12 sm:gap-12 sm:pb-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div class="max-w-xs">
                <x-logo :logo-image="$logoImage" />
                <p class="mt-5 text-sm leading-relaxed text-ink-2">
                    A premium digital product studio building scalable websites, SaaS,
                    AI and mobile products for ambitious founders and teams.
                </p>
                <div class="mt-6 flex flex-wrap gap-2">
                    @foreach ($socialLinks as $social)
                        <a
                            href="{{ $social['href'] }}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-ink-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/40 hover:bg-brand/10 hover:text-ink"
                        >{{ $social['label'] }}</a>
                    @endforeach
                </div>
            </div>

            <div class="flex flex-col gap-3.5">
                <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Navigate</h4>
                @foreach ($navLinks as $link)
                    <a href="/{{ $link['href'] }}" class="text-sm text-ink-2 transition-colors hover:text-ink">{{ $link['label'] }}</a>
                @endforeach
                @if ($showWorkLink)
                    <a href="/#work" class="text-sm text-ink-2 transition-colors hover:text-ink">Case studies</a>
                @endif
            </div>

            @if ($showServices && count($serviceLinks) > 0)
                <div class="flex flex-col gap-3.5">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Services</h4>
                    @foreach ($serviceLinks as $service)
                        <a href="/#services" class="text-sm text-ink-2 transition-colors hover:text-ink">{{ $service['title'] }}</a>
                    @endforeach
                </div>
            @endif

            @if ($email || $whatsapp || $calendly)
                <div class="flex flex-col gap-3.5">
                    <h4 class="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Get in touch</h4>
                    @if ($email)
                        <a href="mailto:{{ $email }}" class="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink">
                            <x-icon name="Mail" class="h-4 w-4" /> {{ $email }}
                        </a>
                    @endif
                    @if ($whatsapp)
                        <a href="{{ $whatsapp }}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink">
                            <x-icon name="MessageCircle" class="h-4 w-4" /> WhatsApp
                        </a>
                    @endif
                    @if ($calendly)
                        <a href="{{ $calendly }}" target="_blank" rel="noopener noreferrer" class="text-sm text-ink-2 transition-colors hover:text-ink">Book on Calendly</a>
                    @endif
                </div>
            @endif
        </div>

        <div class="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-center text-xs text-ink-3 sm:py-8 md:flex-row md:text-left">
            <p>&copy; {{ now()->year }} {{ \App\Support\Site::NAME }}. All rights reserved.</p>
            <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-6 md:justify-end">
                <a href="/privacy" class="transition-colors hover:text-ink-2">Privacy</a>
                <a href="/terms" class="transition-colors hover:text-ink-2">Terms</a>
                <span class="text-ink-3/70">Crafted with intent.</span>
            </div>
        </div>
    </x-container>
</footer>
