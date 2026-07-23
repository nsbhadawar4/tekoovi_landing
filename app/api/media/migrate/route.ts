import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import { migrateContentImages } from "@/backend/controllers/media.controller";

export const dynamic = "force-dynamic";

// POST /api/media/migrate — move any inline base64 images in the content into
// the media store (admin only). Run once to speed up existing content.
export async function POST() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await migrateContentImages();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/media/migrate] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Migration failed" },
      { status: 500 },
    );
  }
}
