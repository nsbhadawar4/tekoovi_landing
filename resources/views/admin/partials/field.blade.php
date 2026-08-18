@php
    use App\Support\AdminForm;
    use App\Support\Icons;

    $value = AdminForm::value($field, $record);
    $base = 'mt-2 w-full rounded-xl border border-line bg-bg/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring';
    $inputId = $idPrefix.'-'.$field['name'];
@endphp

@switch($field['type'])

    @case('image')
        <div
            data-image-field
            data-aspect="{{ $field['aspect'] ?? 16 / 10 }}"
            data-fit="{{ $field['fit'] ?? 'cover' }}"
            data-output-width="{{ $field['outputWidth'] ?? 1100 }}"
            class="mt-2"
        >
            <input type="hidden" name="{{ $field['name'] }}" value="{{ $value }}" data-image-input>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div
                    data-image-preview
                    class="relative w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl border border-line bg-bg/50 bg-center bg-no-repeat sm:w-40"
                    style="aspect-ratio: {{ $field['aspect'] ?? 16 / 10 }}; background-size: {{ ($field['fit'] ?? 'cover') === 'contain' ? 'contain' : 'cover' }}"
                >
                    <div data-image-empty class="absolute inset-0 grid place-items-center text-[11px] text-ink-3">No image</div>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" data-image-pick class="rounded-lg border border-line bg-white/[0.02] px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50">
                        Upload image
                    </button>
                    <button type="button" data-image-remove class="hidden rounded-lg border border-red-500/30 bg-red-500/[0.04] px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10">
                        Remove
                    </button>
                </div>
            </div>
            <input type="file" accept="image/*" data-image-file class="hidden">
            <p data-image-error class="mt-2 hidden text-xs text-red-400"></p>
        </div>
        @break

    @case('boolean')
        <div class="mt-2 flex items-center justify-between gap-3">
            <span class="text-sm text-ink-2">{{ $field['label'] }}</span>
            <input type="hidden" id="{{ $inputId }}" name="{{ $field['name'] }}" value="{{ $value }}">
            @include('admin.partials.switches', [
                'kind' => 'boolean',
                'name' => $field['name'],
                'label' => $field['label'],
                'on' => $value === '1',
                'inputId' => $inputId,
            ])
        </div>
        @break

    @case('icon')
        <div class="mt-2 flex items-center gap-2.5">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-3">
                <x-icon :name="$value" class="h-4 w-4" />
            </span>
            <select name="{{ $field['name'] }}" class="w-full rounded-xl border border-line bg-bg/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow focus:focus-ring">
                <option value="">— pick an icon —</option>
                @foreach (Icons::PICKABLE as $icon)
                    <option value="{{ $icon }}" @selected($value === $icon)>{{ $icon }}</option>
                @endforeach
            </select>
        </div>
        @break

    @case('select')
        <select name="{{ $field['name'] }}" class="{{ $base }}">
            @foreach ($field['options'] ?? [] as $option)
                <option value="{{ $option['value'] }}" @selected($value === $option['value'])>{{ $option['label'] }}</option>
            @endforeach
        </select>
        @break

    @case('textarea')
        <textarea
            name="{{ $field['name'] }}"
            rows="3"
            placeholder="{{ $field['placeholder'] ?? '' }}"
            class="{{ $base }}"
        >{{ $value }}</textarea>
        @break

    @default
        <input
            type="{{ $field['type'] === 'number' ? 'number' : 'text' }}"
            name="{{ $field['name'] }}"
            value="{{ $value }}"
            placeholder="{{ $field['placeholder'] ?? '' }}"
            class="{{ $base }}"
        >
@endswitch
