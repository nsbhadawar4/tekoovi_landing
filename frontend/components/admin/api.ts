/* -------------------------------------------------------------- */
/*  Client for the CMS API.                                        */
/*                                                                 */
/*  Every admin screen goes through this, so the response shape,   */
/*  error handling and the "session expired" redirect are written  */
/*  once rather than in each module.                               */
/* -------------------------------------------------------------- */

export interface ApiMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiResult<T> {
  ok: boolean;
  data: T | null;
  message: string;
  /** Field-level messages from a 422, keyed by field name. */
  errors: Record<string, string>;
  meta?: ApiMeta;
  status: number;
}

/** Thrown for a 401 so callers can bounce to the login screen. */
export class SessionExpired extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(`/api/cms${path}`, {
      cache: "no-store",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
  } catch {
    // The request never landed — the dev server is restarting, or the
    // connection dropped. Present it like any other failure.
    return {
      ok: false,
      data: null,
      message: "Can't reach the server. Check your connection and try again.",
      errors: {},
      status: 0,
    };
  }

  if (response.status === 401) throw new SessionExpired();

  const body = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
    meta?: ApiMeta;
  } | null;

  return {
    ok: response.ok && body?.success !== false,
    data: body?.data ?? null,
    message: body?.message ?? (response.ok ? "" : "Something went wrong."),
    errors: body?.errors ?? {},
    meta: body?.meta,
    status: response.status,
  };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  remove: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Turns `?page=2&search=x` params into a query string, skipping empties. */
export function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
