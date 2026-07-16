import mongoose, { Schema } from "mongoose";
import type { ContentData } from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Content model.                                                 */
/*                                                                 */
/*  The whole landing-page content object is stored as a single    */
/*  document (mirroring backend/data/content.json). This keeps the  */
/*  repository logic identical to the file store — read the doc,    */
/*  mutate, write it back — so the collection/singleton CRUD in     */
/*  the repository needs no per-section models.                    */
/* -------------------------------------------------------------- */

export interface ContentDoc {
  key: string;
  data: ContentData;
}

const ContentSchema = new Schema<ContentDoc>(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { minimize: false, timestamps: true, collection: "content" },
);

export const ContentModel =
  (mongoose.models.Content as mongoose.Model<ContentDoc>) ||
  mongoose.model<ContentDoc>("Content", ContentSchema);
