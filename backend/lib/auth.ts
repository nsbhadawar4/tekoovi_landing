import crypto from "crypto";
import { cookies } from "next/headers";

/* -------------------------------------------------------------- */
/*  Admin auth — simple password + httpOnly cookie.               */
/*                                                                 */
/*  The cookie stores a SHA-256 of the password (never the raw    */
/*  password). To verify a session we recompute that hash from    */
/*  ADMIN_PASSWORD and compare. Good enough for a single admin;   */
/*  swap for real auth later if needed.                           */
/* -------------------------------------------------------------- */

export const SESSION_COOKIE = "admin_session";

/** Fall back to dev defaults so the panel works out of the box. */
function adminEmail(): string {
  return process.env.ADMIN_EMAIL || "tekoovi@gmail.com";
}
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

/** The token value stored in the session cookie (tied to email + password). */
export function sessionToken(): string {
  return crypto
    .createHash("sha256")
    .update(`${adminEmail()}:${adminPassword()}`)
    .digest("hex");
}

/** Both the email and the password must match. */
export function verifyCredentials(email: unknown, password: unknown): boolean {
  return (
    typeof email === "string" &&
    typeof password === "string" &&
    email.trim().toLowerCase() === adminEmail().toLowerCase() &&
    password === adminPassword()
  );
}

/** True when the current request carries a valid admin session cookie. */
export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === sessionToken();
}
