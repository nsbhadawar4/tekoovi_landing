import { cache } from "react";
import seedContent from "@/backend/data/content.json";
import { apiUrl } from "@/lib/api";
import type { ContentData } from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Content for the site.                                          */
/*                                                                 */
/*  The Laravel API owns the database and all the business logic   */
/*  now — validation, coercion and field visibility all happen     */
/*  there. This is the one seam left on the Next.js side: pages    */
/*  ask for content, this fetches it.                              */
/* -------------------------------------------------------------- */

/**
 * Full content object for the site, with every field switched off in the admin
 * already blanked out by the API — so hidden content never reaches the browser.
 *
 * Wrapped in React `cache()` so the many callers in a single request — the site
 * layout, the page, and its generateMetadata — share ONE round trip.
 * `no-store` keeps admin edits showing on the very next request.
 */
export const getContent = cache(async (): Promise<ContentData> => {
  try {
    const res = await fetch(apiUrl("/content"), { cache: "no-store" });
    if (!res.ok) throw new Error(`API responded ${res.status}`);

    const json = (await res.json()) as { data?: ContentData };
    if (!json.data) throw new Error("API response had no data");

    return json.data;
  } catch (err) {
    // Next signals "this route can't be static" by throwing through fetch.
    // That isn't a failure — let it through so the route is marked dynamic.
    if ((err as { digest?: string })?.digest?.startsWith("DYNAMIC_SERVER_USAGE")) {
      throw err;
    }

    // A backend hiccup must not take the site down: fall back to the bundled
    // content and log loudly.
    console.error("[content] Laravel API read failed, serving seed content:", err);

    return seedContent as unknown as ContentData;
  }
});
