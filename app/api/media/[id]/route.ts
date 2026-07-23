import { getMedia } from "@/backend/repository/media.repository";

type Params = { params: Promise<{ id: string }> };

// GET /api/media/:id — serve a stored image, cached hard (content is immutable:
// a new upload gets a new id, so this URL's bytes never change).
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const media = await getMedia(id);
    if (!media) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Bad/malformed id (e.g. CastError) — treat as not found.
    return new Response("Not found", { status: 404 });
  }
}
