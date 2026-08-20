{{--
  The add/edit dialog for a collection.

  Every row's form is rendered once into a hidden template block; opening the
  dialog copies the right one in. That keeps the whole thing server-rendered —
  no client-side form building, no second source of truth for what a field looks
  like — while still opening instantly.

  Bottom sheet on a phone, centred dialog from `sm` up. The action bar is pinned
  so Save is always reachable in a long form.
--}}

<div data-editor-templates class="hidden">
    <div
        data-template-new
        data-action="{{ route('admin.section.store', $section) }}"
        data-method="POST"
        data-title="Add {{ $definition['singular'] }}"
    >
        @include('admin.partials.field-rows', [
            'section' => $section,
            'fields' => $definition['fields'],
            'record' => [],
            'card' => false,
            'idPrefix' => 'new',
        ])
    </div>

    @foreach ($items as $item)
        <div
            data-template-id="{{ $item['id'] }}"
            data-action="{{ route('admin.section.item.update', [$section, $item['id']]) }}"
            data-method="PUT"
            data-title="Edit {{ $definition['singular'] }}"
        >
            @include('admin.partials.field-rows', [
                'section' => $section,
                'fields' => $definition['fields'],
                'record' => $item,
                'card' => false,
                'idPrefix' => 'i'.$item['id'],
            ])
        </div>
    @endforeach
</div>

<div data-editor class="fixed inset-0 z-50 hidden items-end justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-4 flex">
    <form
        method="POST"
        data-editor-form
        data-visibility-form
        class="card-elevated flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl sm:max-h-[90vh] sm:rounded-2xl"
    >
        @csrf
        <input type="hidden" name="_method" value="POST" data-editor-method>

        <div class="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
            <h3 data-editor-title class="truncate text-base font-semibold text-ink sm:text-lg"></h3>
            <button
                type="button"
                data-editor-close
                aria-label="Close"
                class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
                <x-icon name="X" class="h-4 w-4" />
            </button>
        </div>

        <div data-editor-fields class="scroll-slim min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"></div>

        <div class="flex gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6">
            <button
                type="button"
                data-editor-close
                class="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:flex-none sm:py-2"
            >
                Cancel
            </button>
            <button
                type="submit"
                class="flex-1 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:flex-none sm:py-2"
            >
                Save
            </button>
        </div>
    </form>
</div>
