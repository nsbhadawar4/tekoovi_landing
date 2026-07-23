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
  return { contentType: doc.contentType, data: toBuffer(doc.data) };
}

/**
 * `.lean()` returns a binary field as a BSON `Binary` object, not a Node
 * Buffer — feeding that straight to the Response produces garbage bytes (a
 * broken image). Normalise every shape (Buffer, BSON Binary, ArrayBuffer) to a
 * real Buffer here.
 */
function toBuffer(raw: unknown): Buffer {
  if (Buffer.isBuffer(raw)) return raw;
  const bin = raw as { buffer?: unknown; value?: (asRaw?: boolean) => unknown };
  if (bin?.buffer && Buffer.isBuffer(bin.buffer)) return bin.buffer;
  if (typeof bin?.value === "function") {
    const v = bin.value(true);
    if (Buffer.isBuffer(v)) return v;
    if (typeof v === "string") return Buffer.from(v, "binary");
  }
  return Buffer.from(raw as ArrayBuffer);
}
