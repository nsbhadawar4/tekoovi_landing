import mongoose, { Schema } from "mongoose";

/** Who may sign in, and how much they may do. */
export type Role = "admin" | "editor";

/**
 * An account for the admin panel.
 *
 * The very first admin is seeded from ADMIN_EMAIL / ADMIN_PASSWORD so an
 * existing install keeps working without anyone creating a record by hand;
 * after that, accounts are managed from Users in the panel.
 */
export interface UserDoc {
  email: string;
  name: string;
  /** bcrypt — the plain password is never stored. */
  passwordHash: string;
  role: Role;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true, collection: "users" },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);
