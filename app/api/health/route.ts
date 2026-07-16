import { NextResponse } from "next/server";

/* -------------------------------------------------------------- */
/*  Diagnostic endpoint — visit /api/health to see exactly how the  */
/*  content store is wired. No secrets are returned (only whether   */
/*  MONGODB_URI is set, the database name, and any connection       */
/*  error message). Handy for debugging a deploy; safe to remove.   */
/* -------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export async function GET() {
  const mongoConfigured = Boolean(process.env.MONGODB_URI);

  if (!mongoConfigured) {
    return NextResponse.json({
      store: "file",
      mongoConfigured: false,
      note: "MONGODB_URI is not set — using the local JSON file store. On Vercel this store is read-only, so set MONGODB_URI.",
    });
  }

  try {
    const { connectDB } = await import("@/backend/lib/mongodb");
    const { ContentModel } = await import("@/backend/models/content.model");
    const conn = await connectDB();
    const doc = await ContentModel.findOne({ key: "landing" })
      .select("_id updatedAt")
      .lean();

    return NextResponse.json({
      store: "mongo",
      mongoConfigured: true,
      connected: true,
      database: conn.connection.name,
      collection: "content",
      contentSeeded: Boolean(doc),
    });
  } catch (err) {
    return NextResponse.json(
      {
        store: "mongo",
        mongoConfigured: true,
        connected: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
