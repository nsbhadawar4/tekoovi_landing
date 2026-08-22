import type { MetadataRoute } from "next";

/** Crawl rules. The admin and the API are never for search engines. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL || "https://tekoovi.com").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
