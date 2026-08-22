import { cache } from "react";
import { connectDB } from "@/backend/lib/mongodb";
import { MenuModel, type MenuItem } from "@/backend/models/menu.model";
import { PageModel } from "@/backend/models/page.model";
import { PostModel } from "@/backend/models/post.model";
import { SettingModel } from "@/backend/models/setting.model";
import { TermModel } from "@/backend/models/term.model";
import type { Blog } from "@/backend/types";

/* -------------------------------------------------------------- */
/*  What the public site reads from the CMS.                       */
/*                                                                 */
/*  Posts are mapped onto the existing `Blog` shape so every blog  */
/*  component keeps working untouched — the data moved out of the  */
/*  landing document, the markup did not change at all.            */
/*                                                                 */
/*  Each read is wrapped in React `cache()`, so a page that needs  */
/*  the menu in its header and its footer still costs one query.   */
/* -------------------------------------------------------------- */

/** Only published, and only once its publish time has passed. */
function liveFilter() {
  return { status: "published", publishedAt: { $lte: new Date() } };
}

interface PostRecord {
  _id: unknown;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  gallery?: string[];
  categories?: string[];
  tags?: string[];
  authorName: string;
  readTime: string;
  publishedAt?: Date;
  seo?: Record<string, unknown>;
}

/** A stored post in the shape the existing blog components expect. */
function toBlog(post: PostRecord): Blog & { slug: string; seo?: Record<string, unknown> } {
  const gallery = post.gallery ?? [];

  return {
    id: String(post._id),
    slug: post.slug,
    title: post.title,
    category: post.categories?.[0] ?? "",
    author: post.authorName,
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    readTime: post.readTime,
    excerpt: post.excerpt,
    coverImage: post.featuredImage,
    image1: gallery[0] ?? "",
    image2: gallery[1] ?? "",
    image3: gallery[2] ?? "",
    tags: post.tags ?? [],
    content: post.content,
    seo: post.seo,
  };
}

/* ------------------------------ posts ------------------------------ */

export const getPublishedPosts = cache(async (): Promise<Blog[]> => {
  try {
    await connectDB();
    const posts = await PostModel.find(liveFilter())
      .sort({ publishedAt: -1 })
      .lean<PostRecord[]>();

    return posts.map(toBlog);
  } catch (err) {
    // The blog is one section of a larger page — a database hiccup should not
    // take the whole site down with it.
    console.error("[content] could not load posts:", err);
    return [];
  }
});

export const getPostBySlug = cache(
  async (slug: string): Promise<(Blog & { seo?: Record<string, unknown> }) | null> => {
    try {
      await connectDB();
      const post = await PostModel.findOne({ ...liveFilter(), slug }).lean<PostRecord>();
      return post ? toBlog(post) : null;
    } catch (err) {
      console.error(`[content] could not load post ${slug}:`, err);
      return null;
    }
  },
);

export const getPostsByCategory = cache(
  async (categorySlug: string): Promise<{ name: string; posts: Blog[] } | null> => {
    try {
      await connectDB();

      const term = await TermModel.findOne({
        type: "category",
        slug: categorySlug,
      }).lean();
      if (!term) return null;

      const posts = await PostModel.find({ ...liveFilter(), categories: term.name })
        .sort({ publishedAt: -1 })
        .lean<PostRecord[]>();

      return { name: term.name, posts: posts.map(toBlog) };
    } catch (err) {
      console.error(`[content] could not load category ${categorySlug}:`, err);
      return null;
    }
  },
);

export const getCategories = cache(
  async (): Promise<{ name: string; slug: string }[]> => {
    try {
      await connectDB();
      const terms = await TermModel.find({ type: "category" })
        .select("name slug")
        .sort({ name: 1 })
        .lean();

      return terms.map((term) => ({ name: term.name, slug: term.slug }));
    } catch {
      return [];
    }
  },
);

/* ------------------------------ pages ------------------------------ */

export interface PublicPage {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishedAt?: Date;
  seo?: Record<string, unknown>;
}

export const getPageBySlug = cache(
  async (slug: string): Promise<PublicPage | null> => {
    try {
      await connectDB();
      return await PageModel.findOne({ ...liveFilter(), slug }).lean<PublicPage>();
    } catch (err) {
      console.error(`[content] could not load page ${slug}:`, err);
      return null;
    }
  },
);

export const getPublishedPageSlugs = cache(async (): Promise<string[]> => {
  try {
    await connectDB();
    const pages = await PageModel.find(liveFilter()).select("slug").lean();
    return pages.map((page) => page.slug);
  } catch {
    return [];
  }
});

/* ------------------------------ menus ------------------------------ */

export const getMenu = cache(
  async (location: "header" | "footer"): Promise<MenuItem[]> => {
    try {
      await connectDB();
      const menu = await MenuModel.findOne({ location }).lean();
      if (!menu) return [];

      return [...(menu.items ?? [])]
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order);
    } catch (err) {
      console.error(`[content] could not load the ${location} menu:`, err);
      return [];
    }
  },
);

/* ---------------------------- settings ----------------------------- */

export type SiteSettingsGroups = Record<string, Record<string, unknown>>;

export const getSiteSettings = cache(async (): Promise<SiteSettingsGroups> => {
  try {
    await connectDB();
    const groups = await SettingModel.find().lean();
    return Object.fromEntries(groups.map((group) => [group.group, group.data ?? {}]));
  } catch (err) {
    console.error("[content] could not load settings:", err);
    return {};
  }
});
