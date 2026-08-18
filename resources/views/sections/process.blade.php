@php $steps = $content['process'] ?? []; @endphp

{{--
  Two readings of the same steps:
   - phones get a vertical rail whose progress line fills as you scroll
   - desktop gets a horizontal, swipeable stepper — a process should feel like
     forward motion, not a list
--}}
<x-section id="process" class="relative overflow-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-72 w-3/4 max-w-4xl rounded-full bg-brand/8 blur-[130px]"></div>

    <x-container class="relative">
        <x-section-heading
            eyebrow="How we work"
            title="A process engineered for momentum"
            description="Deliberate stages that take you from a fuzzy idea to a scaled, supported product — with visibility at every step."
        />
    </x-container>

    {{-- ---------------- desktop: horizontal stepper ---------------- --}}
    <x-container class="relative mt-14 hidden lg:block">
        <div class="relative">
            {{-- rail behind the cards --}}
            <span aria-hidden="true" class="absolute inset-x-0 top-[46px] h-px bg-linear-to-r from-transparent via-white/12 to-transparent"></span>
            <x-carousel label="Our process, step by step" show-progress>
                @foreach ($steps as $i => $stage)
                    <li aria-roledescription="slide" aria-label="{{ $i + 1 }} of {{ count($steps) }}" class="shrink-0 snap-start basis-[calc(33.333%-1rem)]">
                        @include('sections.partials.process-card', ['stage' => $stage, 'index' => $i])
                    </li>
                @endforeach
            </x-carousel>
        </div>
    </x-container>

    {{-- ---------------- mobile: scroll-lit timeline ---------------- --}}
    <x-container class="relative lg:hidden">
        <div class="relative mx-auto mt-12 max-w-2xl">
            <div class="absolute bottom-2 left-4 top-2 w-px bg-white/10"></div>
            {{-- The lit half grows as each step reveals, which is what the
                 scroll-linked scaleY did in React. --}}
            <div data-process-rail class="absolute bottom-2 left-4 top-2 w-px origin-top bg-linear-to-b from-brand-2 via-brand to-brand-3"></div>

            <div class="flex flex-col gap-6">
                @foreach ($steps as $i => $stage)
                    <div data-reveal style="--reveal-y: 24px" class="relative pl-12">
                        <span class="absolute left-4 top-7 z-10 grid h-3.5 w-3.5 -translate-x-1/2 place-items-center rounded-full border-2 border-brand-2 bg-bg shadow-[0_0_14px_2px_rgba(138,92,255,0.55)]"></span>
                        @include('sections.partials.process-card', ['stage' => $stage, 'index' => $i])
                    </div>
                @endforeach
            </div>
        </div>
    </x-container>
</x-section>
