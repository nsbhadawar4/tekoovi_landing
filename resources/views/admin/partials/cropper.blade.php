{{--
  Image cropper.

  One instance serves every image field on the page; admin.js opens it with the
  aspect, fit and output width the field declares, then hands back a data URL
  that goes straight to the media store.
--}}
<div data-cropper class="fixed inset-0 z-[90] hidden place-items-center overflow-y-auto bg-bg/80 p-3 backdrop-blur-sm grid sm:p-4">
    <div data-cropper-panel data-pop class="card-elevated my-auto w-full max-w-md rounded-2xl p-4 sm:p-5">
        <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-ink">Crop image</h3>
            <button type="button" data-cropper-close aria-label="Close" class="text-ink-3 transition-colors hover:text-ink disabled:opacity-50">
                <x-icon name="X" class="h-4 w-4" />
            </button>
        </div>

        {{-- crop frame --}}
        <div
            data-cropper-frame
            class="relative mt-4 w-full cursor-grab touch-none overflow-hidden rounded-xl border border-line bg-bg/50 active:cursor-grabbing"
            style="touch-action: none"
        >
            {{-- grid guides --}}
            <div aria-hidden="true" class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                @for ($i = 0; $i < 9; $i++)
                    <div class="border border-white/10"></div>
                @endfor
            </div>
            <div data-cropper-loading class="absolute inset-0 grid place-items-center text-xs text-ink-3">Loading&hellip;</div>
        </div>

        {{-- zoom --}}
        <div class="mt-4 flex items-center gap-3">
            <x-icon name="ZoomIn" class="h-4 w-4 shrink-0 text-ink-3" />
            <input type="range" data-cropper-zoom min="1" max="3" step="0.01" value="1" class="h-1 w-full cursor-pointer accent-brand">
        </div>

        <p class="mt-3 text-[11px] text-ink-3">Drag to reposition &middot; scroll or use the slider to zoom.</p>

        <div class="mt-5 flex gap-3 sm:justify-end">
            <button
                type="button"
                data-cropper-cancel
                class="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50 sm:flex-none sm:py-2"
            >
                Cancel
            </button>
            <button
                type="button"
                data-cropper-apply
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:flex-none sm:py-2"
            >
                <x-icon name="Check" class="h-4 w-4" />
                <span data-cropper-apply-label>Apply</span>
            </button>
        </div>
    </div>
</div>
