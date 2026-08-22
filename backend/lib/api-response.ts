import { NextResponse } from "next/server";
import { getSession, type Session } from "@/backend/lib/auth";
import type { Role } from "@/backend/models/user.model";

/* -------------------------------------------------------------- */
/*  One response shape for every CMS endpoint.                     */
/*                                                                 */
/*  The older /api/content/* routes keep their own {items}/{item}  */
/*  shape — the admin UI and the site read it — so this applies to */
/*  the /api/cms/* family only.                                    */
/* -------------------------------------------------------------- */

export interface ApiMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T, message = "", meta?: ApiMeta) {
  return NextResponse.json({
    success: true,
    ...(message ? { message } : {}),
    data,
    ...(meta ? { meta } : {}),
  });
}

export function created<T>(data: T, message = "Created") {
  return NextResponse.json({ success: true, message, data }, { status: 201 });
}

export function fail(
  message: string,
  status = 400,
  errors?: Record<string, string>,
) {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
}

/** 500 handler: log the detail, return something safe. */
export function serverError(context: string, err: unknown) {
  console.error(`[api/cms] ${context} failed:`, err);

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong. Please try again."
      : err instanceof Error
        ? err.message
        : "Server error";

  return NextResponse.json({ success: false, message }, { status: 500 });
}

/* --------------------------- guards ---------------------------- */

/**
 * Session or 401.
 *
 * Returns a discriminated union so a route can do:
 *   const auth = await requireSession();
 *   if (!auth.ok) return auth.response;
 */
export async function requireSession(): Promise<
  { ok: true; session: Session } | { ok: false; response: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: fail("Unauthorized", 401) };
  }
  return { ok: true, session };
}

/** Session with one of the given roles, or 401/403. */
export async function requireRole(
  ...roles: Role[]
): Promise<{ ok: true; session: Session } | { ok: false; response: NextResponse }> {
  const auth = await requireSession();
  if (!auth.ok) return auth;

  if (!roles.includes(auth.session.role)) {
    return {
      ok: false,
      response: fail("You don't have permission to do that.", 403),
    };
  }
  return auth;
}

/* -------------------------- pagination ------------------------- */

export interface PageQuery {
  page: number;
  perPage: number;
  skip: number;
  search: string;
}

/** Reads ?page/?perPage/?search, clamped so one request can't pull the table. */
export function pageQuery(request: Request, defaultPerPage = 20): PageQuery {
  const params = new URL(request.url).searchParams;

  const page = Math.max(1, Number(params.get("page")) || 1);
  const perPage = Math.min(
    100,
    Math.max(1, Number(params.get("perPage")) || defaultPerPage),
  );

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    search: (params.get("search") || "").trim(),
  };
}

export function meta(query: PageQuery, total: number): ApiMeta {
  return {
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.perPage)),
  };
}

/** Escapes a user's search string so it can't act as a regular expression. */
export function searchRegex(term: string): RegExp {
  return new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}
