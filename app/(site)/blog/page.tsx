import type { Metadata } from "next";
import { getContent } from "@/backend/controllers/content.controller";
import { BlogList } from "@/components/sections/blog";

// Blog posts are admin-editable, so resolve them on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Insights from the studio",
  description:
    "Field notes on design, engineering and shipping AI products from the Tekoovi team.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const { blogs } = await getContent();
  return <BlogList blogs={blogs ?? []} />;
}
