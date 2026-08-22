import type { Blog } from "@/backend/types";
import { slugify } from "@/lib/utils";

export const BLOG_BASE = "/blog";

/**
 * URL segment for a post.
 *
 * CMS posts carry an explicit slug the admin can edit; legacy entries from the
 * landing document derive one from the title, exactly as before.
 */
export function blogSlug(blog: Blog): string {
  return blog.slug || slugify(blog.title, blog.id);
}

export function blogHref(blog: Blog): string {
  return `${BLOG_BASE}/${blogSlug(blog)}`;
}

/** Match by slug, falling back to the raw id so old links keep working. */
export function findBlog(blogs: Blog[], slug: string): Blog | undefined {
  return blogs.find((b) => blogSlug(b) === slug || b.id === slug);
}

/** Cover + gallery images, de-duped and empties removed (feeds the slider). */
export function blogImages(blog: Blog): string[] {
  return [blog.coverImage, blog.image1, blog.image2, blog.image3]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s))
    .filter((s, i, arr) => arr.indexOf(s) === i);
}
