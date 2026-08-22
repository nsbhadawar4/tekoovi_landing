import { connectDB } from "@/backend/lib/mongodb";
import { ActivityModel } from "@/backend/models/activity.model";
import { CONTENT_STATUSES, type ContentStatus } from "@/backend/models/post.model";
import { sanitizeHtml } from "@/backend/lib/sanitize";
import { slugify } from "@/lib/utils";
import type { Session } from "@/backend/lib/auth";

/* -------------------------------------------------------------- */
/*  Shared rules for posts and pages.                              */
/*                                                                 */
/*  The two differ in their fields but behave identically around   */
/*  slugs, publishing and activity, so those rules live here once. */
/* -------------------------------------------------------------- */

export interface ValidationResult {
  errors: Record<string, string>;
}

/**
 * Just enough of a Mongoose model to look a slug up — structural rather than
 * generic, so posts and pages can share one implementation.
 */
type SluggedModel = {
  findOne(filter: Record<string, unknown>): {
    select(fields: string): { lean(): Promise<{ _id: unknown } | null> };
  };
};

/** A slug nobody else in this collection is using. */
export async function uniqueSlug(
  model: SluggedModel,
  desired: string,
  title: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(desired || title, "item");

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const clash = await model.findOne({ slug: candidate }).select("_id").lean();

    if (!clash || String(clash._id) === ignoreId) return candidate;
  }

  // 50 collisions on one title is not a real scenario, but never loop forever.
  return `${base}-${Date.now().toString(36)}`;
}

/** Field checks shared by both types. Empty object means valid. */
export function validateEntry(body: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  const title = String(body.title ?? "").trim();
  if (!title) errors.title = "Title is required.";
  else if (title.length > 200) errors.title = "Title must be under 200 characters.";

  const status = String(body.status ?? "draft");
  if (!CONTENT_STATUSES.includes(status as ContentStatus)) {
    errors.status = "Unknown status.";
  }

  const slug = String(body.slug ?? "").trim();
  if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and hyphens only.";
  }

  if (status === "scheduled" && !body.publishedAt) {
    errors.publishedAt = "A scheduled item needs a date.";
  }

  return { errors };
}

/**
 * When this item should count as live.
 *
 * Publishing without a date stamps now; a scheduled date is kept as given so
 * the read filter (`publishedAt <= now`) releases it on time. Going back to
 * draft clears it, which is what makes the item disappear from the site.
 */
export function resolvePublishedAt(
  status: ContentStatus,
  incoming: unknown,
  existing?: Date | null,
): Date | undefined {
  if (status === "draft" || status === "archived") return undefined;

  if (incoming) {
    const date = new Date(String(incoming));
    if (!Number.isNaN(date.getTime())) return date;
  }

  return existing ?? new Date();
}

/** Normalises the SEO block, dropping anything not in the schema. */
export function cleanSeo(input: unknown): Record<string, unknown> {
  const seo = (input ?? {}) as Record<string, unknown>;

  return {
    title: String(seo.title ?? "").trim(),
    description: String(seo.description ?? "").trim(),
    canonical: String(seo.canonical ?? "").trim(),
    ogTitle: String(seo.ogTitle ?? "").trim(),
    ogDescription: String(seo.ogDescription ?? "").trim(),
    ogImage: String(seo.ogImage ?? "").trim(),
    noindex: seo.noindex === true,
  };
}

/** Editor HTML, stripped of anything that could execute. */
export function cleanContent(input: unknown): string {
  return sanitizeHtml(String(input ?? ""));
}

/** A string array from either an array or a comma-separated string. */
export function stringList(input: unknown): string[] {
  const values = Array.isArray(input) ? input : String(input ?? "").split(",");
  return values.map((value) => String(value).trim()).filter(Boolean);
}

/* --------------------------- activity -------------------------- */

/** One line in the dashboard feed. Never allowed to fail a write. */
export async function recordActivity(
  action: string,
  entity: string,
  title: string,
  session: Session,
  entityId?: string,
): Promise<void> {
  try {
    await connectDB();
    await ActivityModel.create({
      action,
      entity,
      entityId,
      title,
      userName: session.name || session.email,
    });
  } catch (err) {
    console.error("[activity] could not record:", err);
  }
}
