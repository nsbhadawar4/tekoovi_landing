import { Schema } from "mongoose";

/** Per-document SEO overrides. Blank fields fall back to the content itself. */
export interface Seo {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export const SeoSchema = new Schema<Seo>(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    canonical: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    noindex: { type: Boolean, default: false },
  },
  { _id: false },
);
