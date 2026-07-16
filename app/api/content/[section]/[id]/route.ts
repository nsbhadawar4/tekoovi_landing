import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import {
  deleteItem,
  editItem,
  isSection,
} from "@/backend/controllers/content.controller";

type Params = { params: Promise<{ section: string; id: string }> };

// PUT /api/content/:section/:id  — edit an item (admin only)
export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, id } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const result = await editItem(section, id, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }
  return NextResponse.json({ item: result.item });
}

// DELETE /api/content/:section/:id  — delete an item (admin only)
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, id } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  const { ok } = await deleteItem(section, id);
  if (!ok) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
