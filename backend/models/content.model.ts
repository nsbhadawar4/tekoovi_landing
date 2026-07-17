import mongoose, { Schema } from "mongoose";
import type { ContentData } from "@/backend/types";

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
