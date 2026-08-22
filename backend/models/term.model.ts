import mongoose, { Schema } from "mongoose";

/** Categories and tags share one collection; `type` tells them apart. */
export type TermType = "category" | "tag";

export interface TermDoc {
  type: TermType;
  name: string;
  slug: string;
  description?: string;
}

const TermSchema = new Schema<TermDoc>(
  {
    type: { type: String, enum: ["category", "tag"], required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true, collection: "terms" },
);

// A slug only has to be unique within its own kind, so /category/design and a
// "design" tag can both exist.
TermSchema.index({ type: 1, slug: 1 }, { unique: true });

export const TermModel =
  (mongoose.models.Term as mongoose.Model<TermDoc>) ||
  mongoose.model<TermDoc>("Term", TermSchema);
