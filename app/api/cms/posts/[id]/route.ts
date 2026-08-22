import mongoose from "mongoose";
import {
  fail,
  ok,
  requireSession,
  serverError,
} from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { PostModel, type ContentStatus } from "@/backend/models/post.model";
import {
  cleanContent,
  cleanSeo,
  recordActivity,
  resolvePublishedAt,
  stringList,
  uniqueSlug,
  validateEntry,
} from "@/backend/services/content-entry.service";

type Params = { params: Promise<{ id: string }> };

/** A malformed id is a 404, not a 500 — Mongo would throw a CastError. */
function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

/* GET /api/cms/posts/:id — full record for the editor */
export async function GET(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Post not found.", 404);

  try {
    await connectDB();
    const post = await PostModel.findById(id).lean();
    if (!post) return fail("Post not found.", 404);

    return ok(post);
  } catch (err) {
    return serverError(`GET post ${id}`, err);
  }
}

/* PUT /api/cms/posts/:id — update */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Post not found.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const { errors } = validateEntry(body);
    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    await connectDB();
    const post = await PostModel.findById(id);
    if (!post) return fail("Post not found.", 404);

    const title = String(body.title).trim();
    const status = String(body.status ?? post.status) as ContentStatus;
    const wasPublished = post.status === "published";

    post.title = title;
    post.slug = await uniqueSlug(PostModel, String(body.slug ?? post.slug), title, id);
    post.status = status;
    post.excerpt = String(body.excerpt ?? "").trim();
    post.content = cleanContent(body.content);
    post.featuredImage = String(body.featuredImage ?? "").trim();
    post.gallery = stringList(body.gallery);
    post.categories = stringList(body.categories);
    post.tags = stringList(body.tags);
    post.authorName = String(body.authorName ?? post.authorName);
    post.readTime = String(body.readTime ?? "").trim();
    post.publishedAt = resolvePublishedAt(status, body.publishedAt, post.publishedAt);
    post.seo = cleanSeo(body.seo);
    post.updatedBy = auth.session.name;

    await post.save();

    await recordActivity(
      !wasPublished && status === "published" ? "published" : "updated",
      "post",
      title,
      auth.session,
      id,
    );

    return ok(post, "Post updated successfully");
  } catch (err) {
    return serverError(`PUT post ${id}`, err);
  }
}

/* DELETE /api/cms/posts/:id */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Post not found.", 404);

  try {
    await connectDB();
    const post = await PostModel.findByIdAndDelete(id);
    if (!post) return fail("Post not found.", 404);

    await recordActivity("deleted", "post", post.title, auth.session, id);

    return ok({ id }, "Post deleted");
  } catch (err) {
    return serverError(`DELETE post ${id}`, err);
  }
}
