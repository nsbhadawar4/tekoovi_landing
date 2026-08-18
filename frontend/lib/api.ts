/* -------------------------------------------------------------- */
/*  Laravel API client.                                             */
/*                                                                  */
/*  Every call to the backend goes through here, so the API's        */
/*  location is one environment variable rather than a string        */
/*  scattered through components:                                    */
/*                                                                   */
/*    NEXT_PUBLIC_API_URL=http://localhost:8000/api      (local)     */
/*    NEXT_PUBLIC_API_URL=https://api.example.com/api    (production)*/
/* -------------------------------------------------------------- */

const DEFAULT_BASE = "http://localhost:8000/api";

/** Base URL of the Laravel API, without a trailing slash. */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE
).replace(/\/+$/, "");

/** Absolute URL for an API path, e.g. apiUrl("/content/hero"). */
export function apiUrl(path: string): string {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Browser fetch against the API.
 *
 * `credentials: "include"` sends the admin session cookie, which the API sets
 * on its own origin — that plus the CORS allow-list on the Laravel side is what
 * keeps the existing login flow working across two ports.
 */
export function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(apiUrl(path), { credentials: "include", ...init });
}

/** Same, with a JSON body and the header that goes with it. */
export function apiSend(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<Response> {
  return apiFetch(path, {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
}
