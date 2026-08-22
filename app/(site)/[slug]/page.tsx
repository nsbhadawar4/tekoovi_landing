import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPageBySlug,
  getPublishedPageSlugs,
  getSiteSettings,
} from "@/backend/services/public-content.service";
import { CmsPage } from "@/components/sections/cms-page";

/**
 * Catch-all for CMS pages.
 *
 * Next matches specific routes before a dynamic one, so every hand-built page
 * (/blog, /privacy, the detail routes) still wins. This only answers for slugs
 * an admin created, and 404s for anything else.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getPublishedPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [page, settings] = await Promise.all([getPageBySlug(slug), getSiteSettings()]);

  if (!page) return { title: "Page not found" };

  const seo = (page.seo ?? {}) as Record<string, string | boolean>;
  const title = String(seo.title || page.title);
  const description = String(
    seo.description || page.excerpt || settings.seo?.defaultDescription || "",
  );
  const image = String(seo.ogImage || page.featuredImage || settings.seo?.ogImage || "");

  return {
    title,
    description,
    alternates: { canonical: String(seo.canonical || `/${page.slug}`) },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: String(seo.ogTitle || title),
      description: String(seo.ogDescription || description),
      type: "website",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function CmsPageRoute({ params }: Params) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return <CmsPage page={page} />;
}
