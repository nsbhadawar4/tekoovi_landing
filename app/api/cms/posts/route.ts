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
import {
  cleanContent,
  cleanSeo,
  recordActivity,
  resolvePublishedAt,
  stringList,
  uniqueSlug,
  validateEntry,
} from "@/backend/services/content-entry.service";
import type { ContentStatus } from "@/backend/models/post.model";

/* GET /api/cms/posts — list for the admin table.
   ?search= ?status= ?category= ?page= ?perPage= */
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

    const category = params.get("category");
    if (category && category !== "all") filter.categories = category;

    if (query.search) {
      const pattern = searchRegex(query.search);
      filter.$or = [{ title: pattern }, { excerpt: pattern }, { slug: pattern }];
    }

    // The body is the biggest field by far and the table never shows it.
    const [items, total] = await Promise.all([
      PostModel.find(filter)
        .select("-content")
        .sort({ updatedAt: -1 })
        .skip(query.skip)
        .limit(query.perPage)
        .lean(),
      PostModel.countDocuments(filter),
    ]);

    return ok(items, "", meta(query, total));
  } catch (err) {
    return serverError("GET posts", err);
  }
}

/* POST /api/cms/posts — create */
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

    const post = await PostModel.create({
      title,
      slug: await uniqueSlug(PostModel, String(body.slug ?? ""), title),
      status,
      excerpt: String(body.excerpt ?? "").trim(),
      content: cleanContent(body.content),
      featuredImage: String(body.featuredImage ?? "").trim(),
      gallery: stringList(body.gallery),
      categories: stringList(body.categories),
      tags: stringList(body.tags),
      authorName: String(body.authorName ?? auth.session.name),
      readTime: String(body.readTime ?? "").trim(),
      publishedAt: resolvePublishedAt(status, body.publishedAt),
      seo: cleanSeo(body.seo),
      createdBy: auth.session.name,
      updatedBy: auth.session.name,
    });

    await recordActivity(
      status === "published" ? "published" : "created",
      "post",
      title,
      auth.session,
      String(post._id),
    );

    return created(post, "Post created successfully");
  } catch (err) {
    return serverError("POST posts", err);
  }
}
