import mongoose, { Schema } from "mongoose";

/**
 * Site settings, one document per group (general, contact, seo, footer).
 *
 * Grouping keeps each admin screen to a single read and a single write, and
 * adding a group later needs no migration.
 */
export interface SettingDoc {
  group: string;
  data: Record<string, unknown>;
}

const SettingSchema = new Schema<SettingDoc>(
  {
    group: { type: String, required: true, unique: true, trim: true },
    data: { type: Schema.Types.Mixed, required: true, default: {} },
  },
  { minimize: false, timestamps: true, collection: "settings" },
);

export const SettingModel =
  (mongoose.models.Setting as mongoose.Model<SettingDoc>) ||
  mongoose.model<SettingDoc>("Setting", SettingSchema);
