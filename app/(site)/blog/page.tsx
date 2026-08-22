import type { Metadata } from "next";
import {
  getPublishedPosts,
  getSiteSettings,
} from "@/backend/services/public-content.service";
import { BlogList } from "@/components/sections/blog";

// Posts are admin-editable, so resolve them on every request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const site = String(settings.general?.siteName ?? "Tekoovi");

  return {
    title: `Blog — Insights from ${site}`,
    description: String(
      settings.seo?.defaultDescription ??
        "Field notes on design, engineering and shipping AI products.",
    ),
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogPage() {
  // Reads the posts collection now rather than the landing document; the
  // component and its markup are unchanged.
  const blogs = await getPublishedPosts();
  return <BlogList blogs={blogs} />;
}
