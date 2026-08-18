<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ContentService;
use App\Support\Sections;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The admin content studio.
 *
 * One page per section, rendered server-side from the same registry the public
 * views read. Form posts go straight to a controller and redirect back with a
 * flash message; only the things that genuinely need to happen without a reload
 * — a visibility switch, an image upload — answer as JSON.
 *
 * Everything here sits behind the `admin` middleware and Laravel's CSRF check.
 */
class ContentController extends Controller
{
    public function __construct(private readonly ContentService $content) {}

    /** GET /admin and GET /admin/section/{section} */
    public function index(string $section = null): View
    {
        $section ??= array_key_first(Sections::navigable());
        $definition = $this->definition($section);

        $header = Sections::header($section);

        return view('admin.dashboard', [
            'section' => $section,
            'definition' => $definition,
            'items' => Sections::isCollection($section) ? $this->content->listSection($section) : [],
            'record' => Sections::isSingleton($section) ? $this->content->getSingleton($section) : [],
            'header' => $header,
            'headerRecord' => $header ? $this->content->getSingleton($header['key']) : [],
            // Every section's toolbar can flip the landing-page blocks it feeds.
            'blocks' => $this->content->getSingleton('pageSections'),
        ]);
    }

    /** POST /admin/section/{section} — add an item to a collection. */
    public function store(Request $request, string $section): RedirectResponse
    {
        $definition = $this->definition($section);
        $result = $this->content->createItem($section, $request->all());

        if (! $result['ok']) {
            return back()->withInput()->withErrors(['form' => $result['error']]);
        }

        return $this->backToSection($section, $definition['singular'].' added');
    }

    /** PUT /admin/section/{section} — save a singleton in place. */
    public function update(Request $request, string $section): RedirectResponse
    {
        $definition = $this->definition($section);
        $result = $this->content->editSingleton($section, $request->all());

        if (! $result['ok']) {
            return back()->withInput()->withErrors(['form' => $result['error']]);
        }

        return $this->backToSection($section, $definition['singular'].' saved');
    }

    /** PUT /admin/section/{section}/{id} — save one item of a collection. */
    public function updateItem(Request $request, string $section, string $id): RedirectResponse
    {
        $definition = $this->definition($section);
        $result = $this->content->editItem($section, $id, $request->all());

        if (! $result['ok']) {
            return back()->withInput()->withErrors(['form' => $result['error']]);
        }

        return $this->backToSection($section, $definition['singular'].' updated');
    }

    /** DELETE /admin/section/{section}/{id} */
    public function destroyItem(string $section, string $id): RedirectResponse
    {
        $definition = $this->definition($section);

        if (! $this->content->deleteItem($section, $id)) {
            return $this->backToSection($section, 'Item not found.', 'error');
        }

        return $this->backToSection($section, $definition['singular'].' deleted');
    }

    /**
     * POST /admin/blocks — show or hide one landing-page block.
     *
     * Answers JSON: the switch flips immediately in the toolbar and rolls back
     * if the save doesn't land, so a reload here would undo the whole point.
     */
    public function toggleBlock(Request $request): JsonResponse
    {
        $key = (string) $request->input('key');
        $block = Sections::block($key);

        if (! $block) {
            return response()->json(['error' => 'Unknown section.'], 404);
        }

        $on = filter_var($request->input('on'), FILTER_VALIDATE_BOOL);
        $this->content->editSingleton('pageSections', [$key => $on]);

        return response()->json([
            'ok' => true,
            'message' => $on
                ? $block['label'].' section is back on the page'
                : $block['label'].' section is hidden from the page',
        ]);
    }

    /* ----------------------------- internals ---------------------------- */

    private function definition(string $section): array
    {
        $definition = Sections::definition($section);

        if (! $definition) {
            throw new NotFoundHttpException('Unknown section');
        }

        return $definition;
    }

    /** Back to the section that was being edited, with a toast waiting. */
    private function backToSection(string $section, string $message, string $type = 'success'): RedirectResponse
    {
        return redirect()
            ->route('admin.section', $section)
            ->with('toast', ['type' => $type, 'message' => $message]);
    }
}
