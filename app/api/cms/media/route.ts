import {
  created,
  fail,
  meta,
  ok,
  pageQuery,
  requireSession,
  searchRegex,
  serverError,
} from "@/backend/lib/api-response";
import { connectDB } from "@/backend/lib/mongodb";
import { MediaModel } from "@/backend/models/media.model";
import { parseDataUrl } from "@/backend/repository/media.repository";
import { recordActivity } from "@/backend/services/content-entry.service";

/** Types the library accepts. Anything else is refused before it is stored. */
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

/** 8 MB — comfortably more than a cropped hero, far less than a memory problem. */
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * A filename that is safe to store and show.
 *
 * The uploader's name is only ever a label here (files are addressed by their
 * document id), but it still gets stripped of paths and anything exotic so it
 * can't be used to smuggle markup into the library UI.
 */
function safeFilename(input: unknown, contentType: string): string {
  const raw = String(input ?? "").split(/[\\/]/).pop() ?? "";
  const cleaned = raw
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^[-.]+|[-.]+$/g, "");

  const stem = cleaned || `image-${Date.now().toString(36)}`;
  return `${stem}.${EXTENSIONS[contentType] ?? "bin"}`;
}

/* GET /api/cms/media — the library grid. ?search= ?type= ?page= */
export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    await connectDB();

    const query = pageQuery(request, 24);
    const params = new URL(request.url).searchParams;
    const filter: Record<string, unknown> = {};

    const type = params.get("type");
    if (type && type !== "all") filter.contentType = searchRegex(type);

    if (query.search) {
      const pattern = searchRegex(query.search);
      filter.$or = [{ filename: pattern }, { alt: pattern }, { title: pattern }];
    }

    // Never select `data` — the buffers are the whole point of not doing that.
    const [items, total] = await Promise.all([
      MediaModel.find(filter)
        .select("-data")
        .sort({ createdAt: -1 })
        .skip(query.skip)
        .limit(query.perPage)
        .lean(),
      MediaModel.countDocuments(filter),
    ]);

    return ok(
      items.map((item) => ({ ...item, url: `/api/media/${String(item._id)}` })),
      "",
      meta(query, total),
    );
  } catch (err) {
    return serverError("GET media", err);
  }
}

/* POST /api/cms/media — upload a data URL, store metadata with it */
export async function POST(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const dataUrl = String(body.dataUrl ?? "");
    if (!dataUrl) return fail("No image data.", 400);

    const parsed = parseDataUrl(dataUrl);
    if (!parsed) return fail("That doesn't look like an image.", 422);

    if (!ALLOWED_TYPES.has(parsed.contentType)) {
      return fail(`${parsed.contentType} files aren't allowed.`, 422);
    }

    if (parsed.buffer.length > MAX_BYTES) {
      return fail("Images must be 8 MB or smaller.", 422);
    }

    await connectDB();

    const media = await MediaModel.create({
      contentType: parsed.contentType,
      data: parsed.buffer,
      filename: safeFilename(body.filename, parsed.contentType),
      size: parsed.buffer.length,
      alt: String(body.alt ?? "").trim(),
      title: String(body.title ?? "").trim(),
    });

    await recordActivity(
      "uploaded",
      "media",
      media.filename,
      auth.session,
      String(media._id),
    );

    return created(
      {
        _id: media._id,
        url: `/api/media/${String(media._id)}`,
        filename: media.filename,
        contentType: media.contentType,
        size: media.size,
        alt: media.alt,
        title: media.title,
      },
      "Uploaded",
    );
  } catch (err) {
    return serverError("POST media", err);
  }
}
