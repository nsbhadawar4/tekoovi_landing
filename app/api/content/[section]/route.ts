import { NextResponse } from "next/server";
import { isAuthed } from "@/backend/lib/auth";
import {
  createItem,
  editSingleton,
  getSingleton,
  isSection,
  listSection,
  sectionIsSingleton,
} from "@/backend/controllers/content.controller";

type Params = { params: Promise<{ section: string }> };

// GET /api/content/:section
//   collection -> { items: [...] }   singleton -> { item: {...} }
// Public: both the landing page and admin read this.
export async function GET(_request: Request, { params }: Params) {
  const { section } = await params;
  if (!isSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }
  if (sectionIsSingleton(section)) {
    return NextResponse.json({ item: await getSingleton(section) });
  }
  return NextResponse.json({ items: await listSection(section) });
}

// POST /api/content/:section — add an item to a collection (admin only)
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

// PUT /api/content/:section — edit a singleton section in place (admin only)
export async function PUT(request: Request, { params }: Params) {
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
  const result = await editSingleton(section, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ item: result.item });
}
