import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCategories,
  getPostsByCategory,
  getSiteSettings,
} from "@/backend/services/public-content.service";
import { BlogList } from "@/components/sections/blog";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** Pre-render the categories that exist; new ones still resolve on demand. */
export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [result, settings] = await Promise.all([
    getPostsByCategory(slug),
    getSiteSettings(),
  ]);

  if (!result) return { title: "Category not found" };

  const site = String(settings.general?.siteName ?? "Tekoovi");

  return {
    title: `${result.name} — ${site} blog`,
    description: `Articles filed under ${result.name}.`,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const result = await getPostsByCategory(slug);
  if (!result) notFound();

  // Same list component the blog index uses, so the design is identical.
  return <BlogList blogs={result.posts} heading={result.name} />;
}
