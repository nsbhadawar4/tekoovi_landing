@extends('admin.layouts.app')

@php
    use App\Support\AdminForm;
    use App\Support\Sections;

    $navigable = Sections::navigable();
    $isSingle = Sections::isSingleton($section);
    $imageField = Sections::imageField($section);
    $activeIndex = array_search($section, array_keys($navigable), true);
@endphp

@section('title', $definition['label'])

@section('body')
    <div class="flex min-h-screen flex-col md:flex-row">
        {{-- ---------------- sidebar (tablet and up) ---------------- --}}
        <aside class="hidden shrink-0 border-line bg-bg-2/50 backdrop-blur-xl md:block md:w-64 md:border-r">
            <div class="flex items-center gap-2.5 px-5 py-5">
                <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white">T</span>
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-ink">{{ \App\Support\Site::NAME }} Admin</p>
                    <p class="text-[11px] text-ink-3">Content studio</p>
                </div>
            </div>
            <nav class="flex max-h-[calc(100vh-88px)] flex-col gap-1 overflow-y-auto px-3 pb-4">
                @foreach ($navigable as $key => $item)
                    @include('admin.partials.nav-button', ['key' => $key, 'item' => $item, 'active' => $key === $section])
                @endforeach
                @include('admin.partials.nav-button', [
                    'key' => '__media',
                    'item' => ['label' => 'Media library', 'onPage' => 'Uploaded images', 'icon' => 'Image'],
                    'active' => false,
                    'href' => route('admin.media'),
                ])
            </nav>
        </aside>

        {{-- ---------------- main ---------------- --}}
        <div class="min-w-0 flex-1">
            {{-- header --}}
            <header class="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
                <div class="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
                    <div class="flex min-w-0 items-center gap-2.5">
                        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white md:hidden">T</span>
                        <div class="min-w-0">
                            <h1 class="truncate text-[15px] font-semibold text-ink md:text-lg">Landing page admin</h1>
                            <p class="mt-0.5 hidden text-xs text-ink-3 sm:block">Changes show on the site instantly.</p>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            data-optimize-images
                            title="Move inline images into the cached media store for faster page loads"
                            aria-label="Optimize images"
                            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50 sm:px-3"
                        >
                            <x-icon name="Sparkles" class="h-4 w-4" />
                            <span data-optimize-label class="hidden sm:inline">Optimize images</span>
                        </button>
                        <a
                            href="{{ url('/') }}"
                            target="_blank"
                            aria-label="View site"
                            class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
                        >
                            <x-icon name="ExternalLink" class="h-4 w-4" />
                            <span class="hidden sm:inline">View site</span>
                        </a>
                        <form method="POST" action="{{ route('admin.logout') }}">
                            @csrf
                            <button
                                type="submit"
                                aria-label="Log out"
                                class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
                            >
                                <x-icon name="LogOut" class="h-4 w-4" />
                                <span class="hidden sm:inline">Log out</span>
                            </button>
                        </form>
                    </div>
                </div>

                {{-- phone: one tap opens the whole section list instead of a
                     21-item horizontal scroll strip nobody can navigate --}}
                <div class="relative md:hidden">
                    <button
                        type="button"
                        data-section-nav-toggle
                        aria-expanded="false"
                        class="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left"
                    >
                        <x-icon :name="$definition['icon']" class="h-4 w-4 shrink-0 text-brand-3" />
                        <span class="min-w-0 flex-1">
                            <span class="block truncate text-sm font-medium text-ink">{{ $definition['label'] }}</span>
                            <span class="block truncate text-[11px] text-ink-3">{{ $definition['onPage'] }}</span>
                        </span>
                        <span class="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-3">
                            {{ $activeIndex + 1 }}/{{ count($navigable) }}
                        </span>
                        <x-icon name="ChevronDown" data-section-nav-chevron class="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300" />
                    </button>

                    <nav data-section-nav-sheet data-pop class="absolute inset-x-0 top-full z-40 hidden max-h-[62vh] overflow-y-auto border-b border-line bg-bg/95 p-3 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                        <div class="grid grid-cols-1 gap-1 min-[430px]:grid-cols-2">
                            @foreach ($navigable as $key => $item)
                                @include('admin.partials.nav-button', ['key' => $key, 'item' => $item, 'active' => $key === $section])
                            @endforeach
                            @include('admin.partials.nav-button', [
                                'key' => '__media',
                                'item' => ['label' => 'Media library', 'onPage' => 'Uploaded images', 'icon' => 'Image'],
                                'active' => false,
                                'href' => route('admin.media'),
                            ])
                        </div>
                    </nav>
                </div>
            </header>

            {{-- content --}}
            <div class="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8 md:px-6">
                {{-- toolbar --}}
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0">
                        <h2 class="truncate text-base font-medium text-ink">
                            {{ $definition['label'] }}
                            @unless ($isSingle)
                                <span class="text-ink-3">({{ count($items) }})</span>
                            @endunless
                        </h2>
                        <p class="mt-0.5 text-xs text-ink-3">On page: {{ $definition['onPage'] }}</p>

                        @unless ($definition['noToggles'] ?? false)
                            <p class="mt-1 text-xs text-ink-3/80">
                                Switch any field to <span class="text-ink-2">Hidden</span> to leave it off the
                                page — the value stays saved.
                            </p>
                        @endunless

                        {{-- Whole-section switches for the blocks this section feeds. --}}
                        @if (! empty($definition['blocks']))
                            <div class="mt-3 flex flex-wrap gap-2">
                                @foreach ($definition['blocks'] as $key)
                                    @php
                                        $block = Sections::block($key);
                                        $label = $block['label'] ?? $key;
                                        $on = Sections::isBlockVisible($blocks, $key);
                                    @endphp
                                    <div
                                        class="flex w-full items-center justify-between gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3 py-2 sm:w-auto sm:justify-start"
                                        title="{{ $block['hint'] ?? '' }}"
                                    >
                                        <span class="min-w-0 truncate text-xs text-ink-2">{{ $label }} section</span>
                                        @include('admin.partials.switches', [
                                            'kind' => 'visibility',
                                            'name' => $key,
                                            'label' => $label.' section',
                                            'on' => $on,
                                            'what' => 'section',
                                            'attribute' => 'data-block-switch',
                                        ])
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>

                    @unless ($isSingle)
                        <button
                            type="button"
                            data-editor-add
                            class="w-full shrink-0 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 sm:w-auto sm:py-2"
                        >
                            + Add new
                        </button>
                    @endunless
                </div>

                @error('form')
                    <p class="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{{ $message }}</p>
                @enderror

                @if ($isSingle)
                    {{-- ------------------- singleton editor ------------------- --}}
                    <div class="card-hairline mt-6 space-y-5 rounded-xl p-3 sm:p-5">
                        <form
                            method="POST"
                            action="{{ route('admin.section.update', $section) }}"
                            data-visibility-form
                            class="max-w-2xl space-y-4"
                        >
                            @csrf
                            @method('PUT')

                            @include('admin.partials.field-rows', [
                                'section' => $section,
                                'fields' => $definition['fields'],
                                'record' => $record,
                                'card' => true,
                                'idPrefix' => $section,
                            ])

                            <div class="flex justify-end pt-1">
                                <button
                                    type="submit"
                                    class="w-full rounded-xl btn-brand px-5 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:w-auto"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </div>
                @else
                    {{-- ------------------- collection list ------------------- --}}
                    @if ($header)
                        <div class="card-hairline mt-6 rounded-2xl p-4 sm:p-6">
                            <p class="text-sm font-medium text-ink">{{ $header['label'] }}</p>
                            <form
                                method="POST"
                                action="{{ route('admin.section.update', $header['key']) }}"
                                data-visibility-form
                                class="mt-4 max-w-2xl space-y-4"
                            >
                                @csrf
                                @method('PUT')

                                @include('admin.partials.field-rows', [
                                    'section' => $header['key'],
                                    'fields' => $header['fields'],
                                    'record' => $headerRecord,
                                    'card' => false,
                                    'idPrefix' => $header['key'],
                                ])

                                <div class="flex justify-end pt-1">
                                    <button
                                        type="submit"
                                        class="w-full rounded-xl btn-brand px-5 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:w-auto"
                                    >
                                        Save header
                                    </button>
                                </div>
                            </form>
                        </div>

                        <p class="mt-8 text-sm font-medium text-ink">
                            {{ $definition['singular'] }}s <span class="text-ink-3">({{ count($items) }})</span>
                        </p>
                    @endif

                    <div class="{{ $header ? 'mt-3' : 'mt-4' }} space-y-2">
                        @forelse ($items as $item)
                            @php
                                $title = (string) ($definition['titleField'] ? ($item[$definition['titleField']] ?? '') : '');
                                $title = $title !== '' ? $title : '(untitled)';
                                $img = $imageField ? (string) ($item[$imageField] ?? '') : '';
                                $hiddenCount = AdminForm::hiddenCount($item);
                            @endphp
                            <div class="card-hairline flex flex-wrap items-center gap-3 rounded-xl p-3 transition-colors hover:border-white/15 sm:flex-nowrap sm:gap-4 sm:p-4">
                                @if ($imageField)
                                    <div
                                        class="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-bg-2 bg-cover bg-center sm:w-28"
                                        @if ($img) style="background-image: url('{{ $img }}')" @endif
                                    >
                                        @unless ($img)
                                            <span class="absolute inset-0 grid place-items-center font-display text-xl font-bold text-ink/15">
                                                {{ mb_substr($title, 0, 1) }}
                                            </span>
                                        @endunless
                                    </div>
                                @endif

                                <div class="min-w-0 flex-1 basis-40">
                                    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-ink">
                                        <span class="min-w-0 truncate">{{ $title }}</span>
                                        @if ($hiddenCount > 0)
                                            <span
                                                title="Fields switched off for this item"
                                                class="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-200"
                                            >
                                                <x-icon name="EyeOff" class="h-3 w-3" />
                                                {{ $hiddenCount }} hidden
                                            </span>
                                        @endif
                                    </p>
                                    @if (! empty($definition['subField']))
                                        <p class="truncate text-xs text-ink-3">{{ $item[$definition['subField']] ?? '' }}</p>
                                    @endif
                                </div>

                                <div class="flex w-full shrink-0 gap-2 sm:w-auto">
                                    <button
                                        type="button"
                                        data-editor-edit="{{ $item['id'] }}"
                                        class="flex-1 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-xs text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:flex-none sm:py-1.5"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        data-delete-trigger="{{ route('admin.section.item.destroy', [$section, $item['id']]) }}"
                                        data-delete-label="{{ $title }}"
                                        data-delete-noun="{{ mb_strtolower($definition['singular']) }}"
                                        class="flex-1 rounded-lg border border-red-500/30 bg-red-500/[0.04] px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/10 sm:flex-none sm:py-1.5"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        @empty
                            <p class="py-8 text-center text-sm text-ink-3">Nothing here yet. Click &ldquo;Add new&rdquo;.</p>
                        @endforelse
                    </div>
                @endif
            </div>
        </div>
    </div>
@endsection

@section('dialogs')
    @unless ($isSingle)
        @include('admin.partials.editor', [
            'section' => $section,
            'definition' => $definition,
            'items' => $items,
        ])
        @include('admin.partials.delete-dialog')
    @endunless

    @include('admin.partials.cropper')
@endsection
