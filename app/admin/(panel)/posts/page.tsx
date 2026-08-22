import { connectDB } from "@/backend/lib/mongodb";
import { TermModel } from "@/backend/models/term.model";
import { ContentList } from "@/components/admin/content-list";

export const dynamic = "force-dynamic";

export default async function PostsPage() {
  // The category filter needs the list up front; it is a tiny query.
  await connectDB();
  const categories = await TermModel.find({ type: "category" })
    .select("name")
    .sort({ name: 1 })
    .lean();

  return (
    <ContentList
      resource="posts"
      singular="Post"
      plural="Posts"
      description="Everything published to the blog."
      publicPath="/blog"
      categories={categories.map((term) => ({ name: term.name }))}
    />
  );
}
