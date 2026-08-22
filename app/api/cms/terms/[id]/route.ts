import mongoose from "mongoose";
import { fail, ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { PostModel } from "@/backend/models/post.model";
import { TermModel } from "@/backend/models/term.model";
import { recordActivity } from "@/backend/services/content-entry.service";
import { slugify } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

function invalidId(id: string): boolean {
  return !mongoose.Types.ObjectId.isValid(id);
}

/* PUT /api/cms/terms/:id — rename, re-slug or re-describe */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Not found.", 404);

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const name = String(body.name ?? "").trim();
    if (!name) {
      return fail("Please fix the highlighted fields.", 422, {
        name: "Name is required.",
      });
    }

    await connectDB();
    const term = await TermModel.findById(id);
    if (!term) return fail("Not found.", 404);

    const slug = slugify(String(body.slug ?? term.slug), name.toLowerCase());
    const clash = await TermModel.findOne({ type: term.type, slug }).select("_id").lean();
    if (clash && String(clash._id) !== id) {
      return fail("Please fix the highlighted fields.", 422, {
        slug: `A ${term.type} with that slug already exists.`,
      });
    }

    // Posts reference terms by name, so a rename has to travel with it —
    // otherwise every post using the old name silently loses its category.
    const previousName = term.name;

    term.name = name;
    term.slug = slug;
    term.description = String(body.description ?? "").trim();
    await term.save();

    if (previousName !== name) {
      const field = term.type === "category" ? "categories" : "tags";
      await PostModel.updateMany(
        { [field]: previousName },
        { $set: { [`${field}.$[element]`]: name } },
        { arrayFilters: [{ element: previousName }] },
      );
    }

    await recordActivity("updated", term.type, name, auth.session, id);

    return ok(term, "Saved");
  } catch (err) {
    return serverError(`PUT term ${id}`, err);
  }
}

/* DELETE /api/cms/terms/:id — refused while posts still use it */
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (invalidId(id)) return fail("Not found.", 404);

  try {
    await connectDB();
    const term = await TermModel.findById(id);
    if (!term) return fail("Not found.", 404);

    const field = term.type === "category" ? "categories" : "tags";
    const inUse = await PostModel.countDocuments({ [field]: term.name });

    if (inUse > 0) {
      return fail(
        `${term.name} is still used by ${inUse} post${inUse === 1 ? "" : "s"}. Remove it from those posts first.`,
        409,
      );
    }

    await term.deleteOne();
    await recordActivity("deleted", term.type, term.name, auth.session, id);

    return ok({ id }, "Deleted");
  } catch (err) {
    return serverError(`DELETE term ${id}`, err);
  }
}
