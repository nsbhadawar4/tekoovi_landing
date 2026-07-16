import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import {
  deleteItem,
  editItem,
  isSection,
} from "@/backend/controllers/content.controller";

type Params = { params: Promise<{ section: string; id: string }> };

function serverError(context: string, err: unknown) {
  console.error(`[api/content] ${context} failed:`, err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Server error" },
    { status: 500 },
  );
}

// PUT /api/content/:section/:id  — edit an item (admin only)
export async function PUT(request: Request, { params }: Params) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, id } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    const result = await editItem(section, id, body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ item: result.item });
  } catch (err) {
    return serverError(`PUT ${section}/${id}`, err);
  }
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

  try {
    const { ok } = await deleteItem(section, id);
    if (!ok) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError(`DELETE ${section}/${id}`, err);
  }
}
