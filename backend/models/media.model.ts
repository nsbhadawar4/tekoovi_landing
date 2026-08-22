import mongoose, { Schema } from "mongoose";

/**
 * Uploaded images live here as their own documents rather than inline base64 in
 * the content doc. That keeps the content payload (read on every page render)
 * small, and lets each image be fetched once and cached hard by the browser/CDN.
 *
 * The library fields below (filename, alt, size…) were added when the media
 * screen grew up. They're all optional and defaulted, so the documents uploaded
 * before that keep working untouched — `size` is simply derived from the buffer
 * when it's missing.
 */
export interface MediaDoc {
  contentType: string;
  data: Buffer;
  filename: string;
  /** Bytes. Denormalised so the library can list without loading the buffers. */
  size: number;
  alt: string;
  title: string;
}

const MediaSchema = new Schema<MediaDoc>(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    filename: { type: String, default: "" },
    size: { type: Number, default: 0 },
    alt: { type: String, default: "" },
    title: { type: String, default: "" },
  },
  { timestamps: true, collection: "media" },
);

// The library lists newest-first and searches on name.
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ filename: 1 });

export const MediaModel =
  (mongoose.models.Media as mongoose.Model<MediaDoc>) ||
  mongoose.model<MediaDoc>("Media", MediaSchema);
