import mongoose from "mongoose";
import { fail, ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { PageModel } from "@/backend/models/page.model";
import type { ContentStatus } from "@/backend/models/post.model";
import {
  cleanContent,
  cleanSeo,
  recordActivity,
  resolvePublishedAt,
  uniqueSlug,
  validateEntry,
} from "@/backend/services/content-entry.service";

type Params = { params: Promise<{ id: string }> };

/** A malformed id is a 404, not a 500 — Mongo would throw a CastError. */
function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Page not found.", 404);

  try {
    await connectDB();
    const page = await PageModel.findById(id).lean();
    if (!page) return fail("Page not found.", 404);

    return ok(page);
  } catch (err) {
    return serverError(`GET page ${id}`, err);
  }
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Page not found.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const { errors } = validateEntry(body);
    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    await connectDB();
    const page = await PageModel.findById(id);
    if (!page) return fail("Page not found.", 404);

    const title = String(body.title).trim();
    const status = String(body.status ?? page.status) as ContentStatus;
    const wasPublished = page.status === "published";

    page.title = title;
    page.slug = await uniqueSlug(PageModel, String(body.slug ?? page.slug), title, id);
    page.status = status;
    page.excerpt = String(body.excerpt ?? "").trim();
    page.content = cleanContent(body.content);
    page.featuredImage = String(body.featuredImage ?? "").trim();
    page.publishedAt = resolvePublishedAt(status, body.publishedAt, page.publishedAt);
    page.seo = cleanSeo(body.seo);
    page.updatedBy = auth.session.name;

    await page.save();

    await recordActivity(
      !wasPublished && status === "published" ? "published" : "updated",
      "page",
      title,
      auth.session,
      id,
    );

    return ok(page, "Page updated successfully");
  } catch (err) {
    return serverError(`PUT page ${id}`, err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Page not found.", 404);

  try {
    await connectDB();
    const page = await PageModel.findByIdAndDelete(id);
    if (!page) return fail("Page not found.", 404);

    await recordActivity("deleted", "page", page.title, auth.session, id);

    return ok({ id }, "Page deleted");
  } catch (err) {
    return serverError(`DELETE page ${id}`, err);
  }
}
