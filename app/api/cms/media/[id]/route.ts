import mongoose from "mongoose";
import { fail, ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { ContentModel } from "@/backend/models/content.model";
import { MediaModel } from "@/backend/models/media.model";
import { PageModel } from "@/backend/models/page.model";
import { PostModel } from "@/backend/models/post.model";
import { recordActivity } from "@/backend/services/content-entry.service";

type Params = { params: Promise<{ id: string }> };

function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

/**
 * Is this image referenced anywhere?
 *
 * Deleting an image that a live page still points at leaves a broken picture on
 * the site, so the library checks first and reports where it is used.
 */
async function usedBy(url: string): Promise<string[]> {
  const [posts, pages, landing] = await Promise.all([
    PostModel.find({
      $or: [{ featuredImage: url }, { gallery: url }, { content: { $regex: url } }],
    })
      .select("title")
      .lean(),
    PageModel.find({
      $or: [{ featuredImage: url }, { content: { $regex: url } }],
    })
      .select("title")
      .lean(),
    ContentModel.findOne({ key: "landing" }).lean(),
  ]);

  const places = [
    ...posts.map((post) => `post: ${post.title}`),
    ...pages.map((page) => `page: ${page.title}`),
  ];

  // The landing document is one big blob; a substring check is the honest way
  // to know whether any of its sections still points at this image.
  if (landing && JSON.stringify(landing.data ?? {}).includes(url)) {
    places.push("landing page");
  }

  return places;
}

/* PUT /api/cms/media/:id — alt text and title */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Not found.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    await connectDB();
    const media = await MediaModel.findById(id).select("-data");
    if (!media) return fail("Not found.", 404);

    if (body.alt !== undefined) media.alt = String(body.alt).trim();
    if (body.title !== undefined) media.title = String(body.title).trim();
    await media.save();

    return ok({ ...media.toObject(), url: `/api/media/${id}` }, "Saved");
  } catch (err) {
    return serverError(`PUT media ${id}`, err);
  }
}

/* DELETE /api/cms/media/:id — refused while something still uses it */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Not found.", 404);

  try {
    await connectDB();
    const media = await MediaModel.findById(id).select("-data");
    if (!media) return fail("Not found.", 404);

    const force = new URL(request.url).searchParams.get("force") === "true";
    const places = await usedBy(`/api/media/${id}`);

    if (places.length > 0 && !force) {
      return fail(
        `Still used by ${places.length} item${places.length === 1 ? "" : "s"}: ${places.slice(0, 3).join(", ")}.`,
        409,
        { usedBy: places.join(" | ") },
      );
    }

    await media.deleteOne();
    await recordActivity("deleted", "media", media.filename, auth.session, id);

    return ok({ id }, "Deleted");
  } catch (err) {
    return serverError(`DELETE media ${id}`, err);
  }
}
