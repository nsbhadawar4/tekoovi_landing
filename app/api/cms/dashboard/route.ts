import { ok, requireSession, serverError } from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { ActivityModel } from "@/backend/models/activity.model";
import { MediaModel } from "@/backend/models/media.model";
import { PageModel } from "@/backend/models/page.model";
import { PostModel } from "@/backend/models/post.model";
import { TermModel } from "@/backend/models/term.model";
import { UserModel } from "@/backend/models/user.model";

/**
 * GET /api/cms/dashboard — the overview screen in one round trip.
 *
 * Counts only; nothing here loads a document body, so the dashboard stays fast
 * however much the site grows.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const [
      posts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      pages,
      publishedPages,
      media,
      categories,
      tags,
      users,
      recentActivity,
      recentContent,
    ] = await Promise.all([
      PostModel.countDocuments(),
      PostModel.countDocuments({ status: "published" }),
      PostModel.countDocuments({ status: "draft" }),
      PostModel.countDocuments({ status: "scheduled" }),
      PageModel.countDocuments(),
      PageModel.countDocuments({ status: "published" }),
      MediaModel.countDocuments(),
      TermModel.countDocuments({ type: "category" }),
      TermModel.countDocuments({ type: "tag" }),
      UserModel.countDocuments(),
      ActivityModel.find().sort({ createdAt: -1 }).limit(8).lean(),
      PostModel.find()
        .select("title slug status updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return ok({
      counts: {
        posts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        pages,
        publishedPages,
        media,
        categories,
        tags,
        users,
      },
      recentActivity,
      recentContent,
    });
  } catch (err) {
    return serverError("GET dashboard", err);
  }
}
