import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthed } from "@/backend/lib/auth";

/* -------------------------------------------------------------- */
/*  Image upload — admin only.                                     */
/*  Accepts a (already-cropped) image as multipart/form-data and   */
/*  writes it to public/uploads/projects, returning its URL. That  */
/*  URL is stored in the item's `image` field like any other value.*/
/* -------------------------------------------------------------- */

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPG, PNG or WebP." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image is too large (max 6 MB)." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", "projects");
  await fs.mkdir(dir, { recursive: true });

  const name = `p-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  await fs.writeFile(path.join(dir, name), buffer);

  return NextResponse.json(
    { url: `/uploads/projects/${name}` },
    { status: 201 },
  );
}
