import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/backend/controllers/content.controller";
import {
  getPostBySlug,
  getPublishedPosts,
  getSiteSettings,
} from "@/backend/services/public-content.service";
import { BLOG_BASE, blogSlug } from "@/lib/blog";
import { BlogDetail } from "@/components/sections/blog-detail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/**
 * Metadata comes from the post's own SEO fields, falling back to its content
 * and then to the site defaults — so a post is never published with an empty
 * or duplicated title.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) return { title: "Article not found" };

  const seo = (post.seo ?? {}) as Record<string, string | boolean>;
  const title = String(seo.title || post.title);
  const description = String(
    seo.description || post.excerpt || settings.seo?.defaultDescription || "",
  );
  const image = String(seo.ogImage || post.coverImage || settings.seo?.ogImage || "");

  return {
    title,
    description,
    alternates: {
      canonical: String(seo.canonical || `${BLOG_BASE}/${blogSlug(post)}`),
    },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: String(seo.ogTitle || title),
      description: String(seo.ogDescription || description),
      type: "article",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;

  // The list gives us the neighbours for the prev/next links; contact still
  // comes from the landing content, which owns the site-wide details.
  const [posts, content] = await Promise.all([getPublishedPosts(), getContent()]);

  const index = posts.findIndex((post) => blogSlug(post) === slug || post.id === slug);
  if (index === -1) notFound();

  return (
    <BlogDetail
      blog={posts[index]}
      prev={index > 0 ? posts[index - 1] : undefined}
      next={index < posts.length - 1 ? posts[index + 1] : undefined}
      contact={content.contact}
    />
  );
}
