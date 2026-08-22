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

/* GET /api/cms/pages — list for the admin table. ?search= ?status= ?page= */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const query = pageQuery(request);
    const params = new URL(request.url).searchParams;
    const filter: Record<string, unknown> = {};

    const status = params.get("status");
    if (status && status !== "all") filter.status = status;

    if (query.search) {
      const pattern = searchRegex(query.search);
      filter.$or = [{ title: pattern }, { slug: pattern }];
    }

    const [items, total] = await Promise.all([
      PageModel.find(filter)
        .select("-content")
        .sort({ updatedAt: -1 })
        .skip(query.skip)
        .limit(query.perPage)
        .lean(),
      PageModel.countDocuments(filter),
    ]);

    return ok(items, "", meta(query, total));
  } catch (err) {
    return serverError("GET pages", err);
  }
}

/* POST /api/cms/pages — create */
export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const { errors } = validateEntry(body);
    if (Object.keys(errors).length > 0) {
      return fail("Please fix the highlighted fields.", 422, errors);
    }

    await connectDB();

    const title = String(body.title).trim();
    const status = String(body.status ?? "draft") as ContentStatus;

    const page = await PageModel.create({
      title,
      slug: await uniqueSlug(PageModel, String(body.slug ?? ""), title),
      status,
      excerpt: String(body.excerpt ?? "").trim(),
      content: cleanContent(body.content),
      featuredImage: String(body.featuredImage ?? "").trim(),
      publishedAt: resolvePublishedAt(status, body.publishedAt),
      seo: cleanSeo(body.seo),
      createdBy: auth.session.name,
      updatedBy: auth.session.name,
    });

    await recordActivity(
      status === "published" ? "published" : "created",
      "page",
      title,
      auth.session,
      String(page._id),
    );

    return created(page, "Page created successfully");
  } catch (err) {
    return serverError("POST pages", err);
  }
}
