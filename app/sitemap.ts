import type { MetadataRoute } from "next";
import {
  getCategories,
  getPublishedPageSlugs,
  getPublishedPosts,
} from "@/backend/services/public-content.service";
import { blogSlug } from "@/lib/blog";

/** Absolute base for the sitemap; SITE_URL wins in production. */
function baseUrl(): string {
  return (process.env.SITE_URL || "https://tekoovi.com").replace(/\/$/, "");
}

/**
 * Sitemap built from what is actually published.
 *
 * Drafts and scheduled items are excluded because the service only ever
 * returns live content — nothing here has to know about statuses.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();

  const [posts, pageSlugs, categories] = await Promise.all([
    getPublishedPosts(),
    getPublishedPageSlugs(),
    getCategories(),
  ]);

  const fixed: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return [
    ...fixed,
    ...pageSlugs.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${blogSlug(post)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}
