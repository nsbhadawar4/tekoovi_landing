import mongoose, { Schema } from "mongoose";

/** Where a menu is rendered. */
export type MenuLocation = "header" | "footer" | "custom";

export interface MenuItem {
  label: string;
  /** Either a path ("/about", "#work") or an absolute URL. */
  url: string;
  /** Opens in a new tab when true. */
  newTab: boolean;
  order: number;
  active: boolean;
  /**
   * Landing-page block this item points at, when it does. The site hides the
   * link automatically if that block is switched off — the behaviour the
   * hardcoded nav already had.
   */
  block?: string;
}

export interface MenuDoc {
  name: string;
  location: MenuLocation;
  items: MenuItem[];
}

const MenuItemSchema = new Schema<MenuItem>(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    newTab: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    block: { type: String, default: "" },
  },
  { _id: false },
);

const MenuSchema = new Schema<MenuDoc>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, enum: ["header", "footer", "custom"], required: true },
    items: { type: [MenuItemSchema], default: [] },
  },
  { timestamps: true, collection: "menus" },
);

MenuSchema.index({ location: 1 }, { unique: true, partialFilterExpression: { location: { $in: ["header", "footer"] } } });

export const MenuModel =
  (mongoose.models.Menu as mongoose.Model<MenuDoc>) ||
  mongoose.model<MenuDoc>("Menu", MenuSchema);
