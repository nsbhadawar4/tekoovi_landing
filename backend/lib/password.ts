import bcrypt from "bcryptjs";

/* -------------------------------------------------------------- */
/*  Password hashing.                                              */
/*                                                                 */
/*  Accounts store a bcrypt hash and nothing else — the plain      */
/*  password never touches the database or a log line.             */
/* -------------------------------------------------------------- */

/** Cost factor: comfortably slow for an attacker, unnoticeable on a login. */
const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

/**
 * Check a password against a stored hash.
 *
 * bcrypt's compare is constant-time for a given hash, so a wrong password can't
 * be distinguished from a right one by how long the check took.
 */
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    // A malformed hash (hand-edited, or from an older scheme) is a failed
    // login, not a crash.
    return false;
  }
}
