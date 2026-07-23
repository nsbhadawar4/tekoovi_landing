import * as content from "@/backend/repository/content.repository";
import { saveMedia } from "@/backend/repository/media.repository";
import type { ContentData } from "@/backend/types";

/**
 * One-time optimisation: walk the whole content tree and move any inline
 * `data:image/...` base64 blobs into the media store, replacing each with its
 * small URL. Existing content authored before the media store shipped is the
 * main cause of heavy page payloads; running this once fixes it. Idempotent —
 * URLs are left untouched, so it's safe to run again.
 */
export async function migrateContentImages(): Promise<{ replaced: number }> {
  let replaced = 0;

  async function walk(value: unknown): Promise<unknown> {
    if (typeof value === "string") {
      if (value.startsWith("data:image/")) {
        const url = await saveMedia(value);
        replaced += 1;
        return url;
      }
      return value;
    }
    if (Array.isArray(value)) {
      const out: unknown[] = [];
      for (const item of value) out.push(await walk(item));
      return out;
    }
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        out[key] = await walk(val);
      }
      return out;
    }
    return value;
  }

  const data = await content.getAll();
  const migrated = (await walk(data)) as ContentData;
  if (replaced > 0) await content.saveAll(migrated);
  return { replaced };
}
