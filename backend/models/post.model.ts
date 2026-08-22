import mongoose, { Schema } from "mongoose";
import { SeoSchema, type Seo } from "./seo.schema";

/**
 * Publication state.
 *
 * `scheduled` is only meaningfully different from `draft` because reads filter
 * on `publishedAt <= now`, so a scheduled post goes live on its own.
 */
export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export const CONTENT_STATUSES: ContentStatus[] = [
  "draft",
  "published",
  "scheduled",
  "archived",
];

export interface PostDoc {
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt: string;
  /** HTML from the editor; sanitised before it is stored. */
  content: string;
  featuredImage: string;
  /** Extra images shown in the detail-page slider. */
  gallery: string[];
  categories: string[];
  tags: string[];
  authorId?: mongoose.Types.ObjectId;
  /** Display name, kept denormalised so a deleted account doesn't blank bylines. */
  authorName: string;
  readTime: string;
  publishedAt?: Date;
  seo: Seo;
  createdBy?: string;
  updatedBy?: string;
}

const PostSchema = new Schema<PostDoc>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: CONTENT_STATUSES, default: "draft", index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    featuredImage: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    categories: { type: [String], default: [], index: true },
    tags: { type: [String], default: [] },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "" },
    readTime: { type: String, default: "" },
    publishedAt: { type: Date },
    seo: { type: SeoSchema, default: () => ({}) },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "posts" },
);

// The blog list is "published, newest first" on every request.
PostSchema.index({ status: 1, publishedAt: -1 });
// Admin search across title and excerpt.
PostSchema.index({ title: "text", excerpt: "text" });

export const PostModel =
  (mongoose.models.Post as mongoose.Model<PostDoc>) ||
  mongoose.model<PostDoc>("Post", PostSchema);
