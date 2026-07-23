import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/backend/controllers/content.controller";
import { BLOG_BASE, blogSlug } from "@/lib/blog";
import { BlogDetail } from "@/components/sections/blog-detail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const { blogs } = await getContent();
  const blog = (blogs ?? []).find(
    (b) => blogSlug(b) === slug || b.id === slug,
  );
  if (!blog) return { title: "Article not found" };

  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: `${BLOG_BASE}/${blogSlug(blog)}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      ...(blog.coverImage ? { images: [blog.coverImage] } : {}),
    },
  };
}

export default async function BlogDetailPage({ params }: Params) {
  const { slug } = await params;
  const { blogs } = await getContent();
  const list = blogs ?? [];

  const index = list.findIndex(
    (b) => blogSlug(b) === slug || b.id === slug,
  );
  if (index === -1) notFound();

  return (
    <BlogDetail
      blog={list[index]}
      prev={index > 0 ? list[index - 1] : undefined}
      next={index < list.length - 1 ? list[index + 1] : undefined}
    />
  );
}
