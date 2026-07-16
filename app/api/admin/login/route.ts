import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  sessionToken,
  verifyCredentials,
} from "@/backend/lib/auth";

// POST /api/admin/login  — { email, password } -> sets session cookie
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!verifyCredentials(body.email, body.password)) {
    return NextResponse.json(
      { ok: false, error: "Wrong email or password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

// DELETE /api/admin/login  — log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
