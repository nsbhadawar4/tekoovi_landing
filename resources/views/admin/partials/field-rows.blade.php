@php
    use App\Support\AdminForm;
    use App\Support\Sections;

    $card = $card ?? false;
    $idPrefix = $idPrefix ?? $section;
    $hidden = array_filter(explode(',', AdminForm::hiddenFields($record)));
    $rows = $card ? AdminForm::cards($fields) : [['key' => 'all', 'fields' => $fields]];
@endphp

{{-- One hidden input carries the switched-off field names, which keeps the
     posted body flat and matches what the write path expects. --}}
<input type="hidden" name="{{ Sections::hiddenKey() }}" value="{{ AdminForm::hiddenFields($record) }}" data-hidden-fields>

@foreach ($rows as $row)
    <div @class(['card-hairline space-y-5 rounded-xl p-4 sm:p-5' => $card])>
        @foreach ($row['fields'] as $field)
            @php
                $canToggle = Sections::isToggleable($section, $field);
                $off = $canToggle && in_array($field['name'], $hidden, true);
            @endphp

            <div data-field-row @class(['opacity-60' => $off])>
                @if ($field['type'] !== 'boolean' || $canToggle)
                    <div class="flex items-start justify-between gap-3">
                        @if ($field['type'] !== 'boolean')
                            <label class="block min-w-0 flex-1 text-xs font-medium leading-relaxed text-ink-3">{{ $field['label'] }}</label>
                        @else
                            <span></span>
                        @endif

                        @if ($canToggle)
                            @include('admin.partials.switches', [
                                'kind' => 'visibility',
                                'name' => $field['name'],
                                'label' => $field['label'],
                                'on' => ! $off,
                                'what' => 'field',
                                'attribute' => 'data-visibility-switch',
                            ])
                        @endif
                    </div>
                @endif

                @include('admin.partials.field', [
                    'field' => $field,
                    'record' => $record,
                    'idPrefix' => $idPrefix,
                ])

                <p data-field-hidden-note @class([
                    'mt-1.5 text-[11px] leading-relaxed text-amber-300/90',
                    'hidden' => ! $off,
                ])>
                    Hidden — this doesn&rsquo;t show on the site. The value is kept for
                    when you switch it back on.
                </p>

                @if (! empty($field['hint']))
                    <p data-field-hint @class(['mt-1.5 text-[11px] leading-relaxed text-ink-3', 'hidden' => $off])>
                        {{ $field['hint'] }}
                    </p>
                @endif
            </div>
        @endforeach
    </div>
@endforeach
