{{-- Soft, slow-drifting aurora blobs. Pure CSS animation — cheap. --}}
<div aria-hidden="true" {{ $attributes->merge(['class' => 'pointer-events-none absolute inset-0 overflow-hidden']) }}>
    <div class="animate-aurora absolute -top-32 left-[15%] h-[520px] w-[520px] rounded-full bg-brand/20 blur-[140px]"></div>
    <div class="animate-aurora absolute top-[20%] right-[8%] h-[440px] w-[440px] rounded-full bg-brand-2/15 blur-[150px] [animation-delay:-7s]"></div>
    <div class="animate-aurora absolute bottom-[-10%] left-[35%] h-[400px] w-[400px] rounded-full bg-[#4a2bb0]/15 blur-[150px] [animation-delay:-13s]"></div>
</div>
