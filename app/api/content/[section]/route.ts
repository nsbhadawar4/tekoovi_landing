import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import {
  createItem,
  isSection,
  listSection,
} from "@/backend/controllers/content.controller";

type Params = { params: Promise<{ section: string }> };

// GET /api/content/:section  — list items (public; landing page & admin read this)
export async function GET(_request: Request, { params }: Params) {
  const { section } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }
  return NextResponse.json({ items: await listSection(section) });
}

// POST /api/content/:section  — add an item (admin only)
export async function POST(request: Request, { params }: Params) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const result = await createItem(section, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ item: result.item }, { status: 201 });
}
