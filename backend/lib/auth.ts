import crypto from "crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/backend/lib/mongodb";
import { verifyPassword } from "@/backend/lib/password";
import { UserModel, type Role } from "@/backend/models/user.model";

/* -------------------------------------------------------------- */
/*  Admin auth — accounts + roles, in an httpOnly cookie.          */
/*                                                                 */
/*  The cookie carries a signed payload (who you are, what you     */
/*  may do) rather than a password hash, so accounts can be added  */
/*  and removed without changing the scheme. Cookie name and login */
/*  endpoint shape are unchanged, so the admin UI keeps working.   */
/* -------------------------------------------------------------- */

export const SESSION_COOKIE = "admin_session";

/** A week — convenient, but it does expire. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

/** Bootstrap credentials, honoured only until the first account exists. */
function envAdmin(): { email: string; password: string } {
  return {
    email: (process.env.ADMIN_EMAIL || "tekoovi@gmail.com").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

/**
 * Key the cookie signature is derived from.
 *
 * AUTH_SECRET is the right thing to set. Without it we fall back to the admin
 * password, which keeps an existing install working at the cost of ending every
 * session when that password changes — the safer default anyway.
 */
function signingKey(): string {
  return process.env.AUTH_SECRET || `fallback:${envAdmin().password}`;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", signingKey()).update(payload).digest("hex");
}

/** `<base64 payload>.<signature>` — change either half and it stops verifying. */
export function encodeSession(session: Session): string {
  const payload = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  // timingSafeEqual throws on a length mismatch, so check that first.
  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as
      | (Session & { exp: number })
      | null;

    if (!data || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }

    return {
      userId: data.userId,
      email: data.email,
      name: data.name,
      role: data.role === "admin" ? "admin" : "editor",
    };
  } catch {
    return null;
  }
}

/* --------------------------- sign in --------------------------- */

/**
 * Check credentials and return the session to store.
 *
 * Accounts in the database are the source of truth. The environment pair works
 * only while no account exists, so a fresh install — or one upgrading from the
 * old single-admin scheme — can always get in.
 */
export async function authenticate(
  email: unknown,
  password: unknown,
): Promise<Session | null> {
  if (typeof email !== "string" || typeof password !== "string") return null;

  const address = email.trim().toLowerCase();
  if (!address || !password) return null;

  await connectDB();
  const user = await UserModel.findOne({ email: address });

  if (user) {
    if (!(await verifyPassword(password, user.passwordHash))) return null;

    user.lastLoginAt = new Date();
    await user.save();

    return {
      userId: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  // No such account — fall back to the bootstrap pair, but only on an install
  // that has no accounts at all.
  const fallback = envAdmin();
  if (
    (await UserModel.exists({})) ||
    address !== fallback.email ||
    password !== fallback.password
  ) {
    return null;
  }

  return {
    userId: "env-admin",
    email: fallback.email,
    name: "Administrator",
    role: "admin",
  };
}

/* --------------------------- sessions -------------------------- */

/** The signed-in user, or null. */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(SESSION_COOKIE)?.value);
}

/** True when the request carries a valid session of any role. */
export async function isAuthed(): Promise<boolean> {
  return (await getSession()) !== null;
}

/** True when the signed-in user may manage users and system settings. */
export async function isAdmin(): Promise<boolean> {
  return (await getSession())?.role === "admin";
}

/** Cookie options shared by login and logout. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
