import mongoose, { Schema } from "mongoose";

/**
 * Uploaded images live here as their own documents rather than inline base64 in
 * the content doc. That keeps the content payload (read on every page render)
 * small, and lets each image be fetched once and cached hard by the browser/CDN.
 */
export interface MediaDoc {
  contentType: string;
  data: Buffer;
}

const MediaSchema = new Schema<MediaDoc>(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true, collection: "media" },
);

export const MediaModel =
  (mongoose.models.Media as mongoose.Model<MediaDoc>) ||
  mongoose.model<MediaDoc>("Media", MediaSchema);
