import mongoose, { Schema } from "mongoose";
import { CONTENT_STATUSES, type ContentStatus } from "./post.model";
import { SeoSchema, type Seo } from "./seo.schema";

/**
 * A CMS-managed page, served by app/(site)/[slug].
 *
 * The hand-built routes (/, /blog, /privacy, /terms, the detail pages) keep
 * their own files — this is for everything an admin adds later, like /about.
 */
export interface PageDoc {
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt: string;
  content: string;
  featuredImage: string;
  publishedAt?: Date;
  seo: Seo;
  createdBy?: string;
  updatedBy?: string;
}

const PageSchema = new Schema<PageDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: CONTENT_STATUSES, default: "draft", index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    publishedAt: { type: Date },
    seo: { type: SeoSchema, default: () => ({}) },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "pages" },
);

PageSchema.index({ status: 1, publishedAt: -1 });
PageSchema.index({ title: "text", excerpt: "text" });

export const PageModel =
  (mongoose.models.Page as mongoose.Model<PageDoc>) ||
  mongoose.model<PageDoc>("Page", PageSchema);
