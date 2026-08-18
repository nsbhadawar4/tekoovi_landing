{{-- Delete confirmation. The form's action is filled in by whichever row was
     clicked, so one dialog serves the whole list. --}}
<div data-delete-dialog class="fixed inset-0 z-[70] hidden place-items-center bg-bg/80 p-4 backdrop-blur-sm grid">
    <div data-pop class="card-elevated w-full max-w-sm rounded-2xl p-6 text-center">
        <div class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-500/10">
            <x-icon name="TriangleAlert" class="h-6 w-6 text-red-400" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-ink">
            Delete this <span data-delete-noun>item</span>?
        </h3>
        <p class="mt-1 text-sm text-ink-3">
            &ldquo;<span data-delete-label></span>&rdquo; will be permanently removed. This can&rsquo;t be undone.
        </p>
        <form method="POST" class="mt-6 flex gap-3">
            @csrf
            @method('DELETE')
            <button
                type="button"
                data-delete-cancel
                class="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="submit"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
                <x-icon name="Trash2" class="h-4 w-4" />
                Delete
            </button>
        </form>
    </div>
</div>
