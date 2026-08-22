import {
  created,
  fail,
  meta,
  ok,
  pageQuery,
  requireSession,
  searchRegex,
  serverError,
} from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { PostModel } from "@/backend/models/post.model";
import { TermModel, type TermType } from "@/backend/models/term.model";
import { recordActivity } from "@/backend/services/content-entry.service";
import { slugify } from "@/lib/utils";

const TYPES: TermType[] = ["category", "tag"];

/* GET /api/cms/terms?type=category — with the post count for each term. */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const query = pageQuery(request, 100);
    const params = new URL(request.url).searchParams;
    const filter: Record<string, unknown> = {};

    const type = params.get("type");
    if (type && TYPES.includes(type as TermType)) filter.type = type;

    if (query.search) filter.name = searchRegex(query.search);

    const [terms, total] = await Promise.all([
      TermModel.find(filter).sort({ type: 1, name: 1 }).skip(query.skip).limit(query.perPage).lean(),
      TermModel.countDocuments(filter),
    ]);

    // How many posts use each term. Counting by name matches how posts store
    // them, and one grouped query beats one count per term.
    const usage = await PostModel.aggregate<{ _id: string; count: number }>([
      { $project: { names: { $concatArrays: ["$categories", "$tags"] } } },
      { $unwind: "$names" },
      { $group: { _id: "$names", count: { $sum: 1 } } },
    ]);
    const counts = new Map(usage.map((row) => [row._id, row.count]));

    const items = terms.map((term) => ({
      ...term,
      postCount: counts.get(term.name) ?? 0,
    }));

    return ok(items, "", meta(query, total));
  } catch (err) {
    return serverError("GET terms", err);
  }
}

/* POST /api/cms/terms — create a category or tag */
export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const name = String(body.name ?? "").trim();
    const type = String(body.type ?? "category") as TermType;
    const errors: Record<string, string> = {};

    if (!name) errors.name = "Name is required.";
    if (!TYPES.includes(type)) errors.type = "Type must be category or tag.";

    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    await connectDB();

    const slug = slugify(String(body.slug ?? name), name.toLowerCase());
    if (await TermModel.exists({ type, slug })) {
      return fail("Please fix the highlighted fields.", 422, {
        slug: `A ${type} with that slug already exists.`,
      });
    }

    const term = await TermModel.create({
      type,
      name,
      slug,
      description: String(body.description ?? "").trim(),
    });

    await recordActivity("created", type, name, auth.session, String(term._id));

    return created(term, `${type === "category" ? "Category" : "Tag"} created`);
  } catch (err) {
    return serverError("POST terms", err);
  }
}
