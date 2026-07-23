import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { connectDB } from "@/backend/lib/mongodb";
import { MediaModel } from "@/backend/models/media.model";

const USE_MONGO = Boolean(process.env.MONGODB_URI);
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export type ParsedDataUrl = { contentType: string; buffer: Buffer };

/** Parse a `data:<type>;base64,<payload>` string into bytes + mime. */
export function parseDataUrl(dataUrl: string): ParsedDataUrl | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1];
  if (!contentType.startsWith("image/")) return null;
  return { contentType, buffer: Buffer.from(match[2], "base64") };
}

/**
 * Persist an image and return the public URL to serve it from.
 *   - With Mongo: a `media` document, served via /api/media/<id> (cacheable).
 *   - Local dev (no Mongo): a hashed file under public/uploads (served static).
 */
export async function saveMedia(dataUrl: string): Promise<string> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error("Invalid image data.");
  const { contentType, buffer } = parsed;

  if (USE_MONGO) {
    await connectDB();
    const doc = await MediaModel.create({ contentType, data: buffer });
    return `/api/media/${String(doc._id)}`;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 16);
  const name = `${hash}.${EXT[contentType] ?? "bin"}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/${name}`;
}

/** Fetch a stored image by id (Mongo backend only). */
export async function getMedia(
  id: string,
): Promise<{ contentType: string; data: Buffer } | null> {
  if (!USE_MONGO) return null;
  await connectDB();
  const doc = await MediaModel.findById(id).lean();
  if (!doc?.data) return null;
  // A Buffer schema field comes back from .lean() as a Node Buffer at runtime;
  // the driver types it as Binary, hence the cast through unknown.
  return { contentType: doc.contentType, data: doc.data as unknown as Buffer };
}
