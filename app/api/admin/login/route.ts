import { NextResponse } from "next/server";
import {
  authenticate,
  encodeSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessionCookieOptions,
} from "@/backend/lib/auth";

// POST /api/admin/login  — { email, password } -> sets session cookie
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  const session = await authenticate(body.email, body.password);

  if (!session) {
    // One message for both wrong-email and wrong-password: telling them apart
    // would confirm which addresses exist.
    return NextResponse.json(
      { ok: false, error: "Wrong email or password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({
    ok: true,
    user: { name: session.name, email: session.email, role: session.role },
  });
  res.cookies.set(
    SESSION_COOKIE,
    encodeSession(session),
    sessionCookieOptions(SESSION_MAX_AGE),
  );
  return res;
}

// DELETE /api/admin/login  — log out
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
  return res;
}
