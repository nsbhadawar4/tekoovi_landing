import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import { saveMedia } from "@/backend/repository/media.repository";

// Uploads are small binary writes — never cache, always run server-side.
export const dynamic = "force-dynamic";

// POST /api/media — store a cropped image (admin only), return its public URL.
export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as {
      dataUrl?: string;
    };
    if (!body.dataUrl) {
      return NextResponse.json({ error: "No image data." }, { status: 400 });
    }
    const url = await saveMedia(body.dataUrl);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("[api/media] upload failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }
}
