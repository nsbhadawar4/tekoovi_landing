import mongoose, { Schema } from "mongoose";

/**
 * "Post published by Abhay" — the recent-activity feed on the dashboard.
 *
 * Deliberately tiny: one line per write, capped by a TTL index so it can never
 * grow into a problem.
 */
export interface ActivityDoc {
  action: string;
  entity: string;
  entityId?: string;
  title?: string;
  userName: string;
}

const ActivitySchema = new Schema<ActivityDoc>(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    title: { type: String, default: "" },
    userName: { type: String, default: "" },
  },
  { timestamps: true, collection: "activity" },
);

ActivitySchema.index({ createdAt: -1 });
// Keep 90 days of history; the feed only ever shows the newest handful.
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const ActivityModel =
  (mongoose.models.Activity as mongoose.Model<ActivityDoc>) ||
  mongoose.model<ActivityDoc>("Activity", ActivitySchema);
