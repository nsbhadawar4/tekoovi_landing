/**
 * End-to-end check of the CMS: admin, API and public site.
 *
 * Creates a post, a page and a category, confirms each appears on the public
 * site, then removes everything it made. Existing content is only read.
 *
 *   node backend/scripts/cms-e2e.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";

let cookie = "";
let passed = 0;
let failed = 0;

function report(name, ok, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  ok ? (passed += 1) : (failed += 1);
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}/api/cms${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

/** Fetches a public page and reports whether it contains the marker. */
async function pageHas(path, marker, name) {
  const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie } });
  const html = await res.text();
  report(name, res.ok && html.includes(marker), `${path} → ${res.status}`);
  return html;
}

async function run() {
  console.log(`\nCMS end-to-end against ${BASE}\n`);

  /* ------------------------------ auth ------------------------------ */
  const login = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || "tekoovi@gmail.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
    }),
  });
  cookie = (login.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  report("admin login", login.ok && cookie.includes("admin_session"));

  const badLogin = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "tekoovi@gmail.com", password: "nope" }),
  });
  report("wrong password rejected", badLogin.status === 401);

  /* --------------------------- admin screens ------------------------ */
  for (const path of [
    "/admin",
    "/admin/posts",
    "/admin/posts/new",
    "/admin/pages",
    "/admin/media",
    "/admin/taxonomy",
    "/admin/menus",
    "/admin/settings",
    "/admin/users",
    "/admin/content",
  ]) {
    const res = await fetch(`${BASE}${path}`, { headers: { Cookie: cookie } });
    report(`admin ${path}`, res.ok, `${res.status}`);
  }

  const guarded = await fetch(`${BASE}/admin/posts`, { redirect: "manual" });
  report("admin redirects when signed out", guarded.status === 307);

  /* ------------------------------ create ---------------------------- */
  const stamp = Date.now().toString(36);

  const post = await api("POST", "/posts", {
    title: `ZZ E2E Post ${stamp}`,
    slug: `zz-e2e-post-${stamp}`,
    status: "published",
    excerpt: "Created by the end-to-end check.",
    content: "<p>Body text</p>",
    categories: ["Engineering"],
    tags: ["e2e"],
    authorName: "Test Runner",
  });
  report("post created and published", post.status === 201, post.json?.data?.slug);

  const page = await api("POST", "/pages", {
    title: `ZZ E2E Page ${stamp}`,
    slug: `zz-e2e-page-${stamp}`,
    status: "published",
    excerpt: "A CMS page.",
    content: "<p>Page body</p>",
  });
  report("page created and published", page.status === 201, page.json?.data?.slug);

  const draft = await api("POST", "/posts", {
    title: `ZZ E2E Draft ${stamp}`,
    status: "draft",
    content: "<p>Not for the public</p>",
  });
  report("draft created", draft.status === 201);

  /* -------------------------- public site --------------------------- */
  await pageHas("/blog", `ZZ E2E Post ${stamp}`, "published post shows on /blog");
  await pageHas(
    `/blog/zz-e2e-post-${stamp}`,
    "Body text",
    "post detail page renders",
  );
  await pageHas(
    `/zz-e2e-page-${stamp}`,
    "Page body",
    "CMS page renders at its slug",
  );
  await pageHas("/category/engineering", "ZZ E2E Post", "category page lists the post");

  const blogHtml = await fetch(`${BASE}/blog`).then((r) => r.text());
  report(
    "draft stays off the public site",
    !blogHtml.includes(`ZZ E2E Draft ${stamp}`),
  );

  /* ----------------------------- SEO -------------------------------- */
  const detail = await fetch(`${BASE}/blog/zz-e2e-post-${stamp}`).then((r) => r.text());
  report(
    "post metadata uses its own title",
    detail.includes(`<title>ZZ E2E Post ${stamp}`),
  );
  report(
    "meta description present",
    detail.includes('name="description" content="Created by the end-to-end check."'),
  );

  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  report("sitemap includes the post", sitemap.includes(`zz-e2e-post-${stamp}`));
  report("sitemap excludes the draft", !sitemap.includes("zz-e2e-draft"));

  const robots = await fetch(`${BASE}/robots.txt`).then((r) => r.text());
  report("robots blocks the admin", robots.includes("/admin"));

  /* ------------------------ existing content ------------------------ */
  await pageHas("/", "Tekoovi", "landing page still renders");
  await pageHas("/privacy", "Privacy", "privacy page still renders");

  /* ------------------------- unpublishing --------------------------- */
  const unpublished = await api("PUT", `/posts/${post.json.data._id}`, {
    title: `ZZ E2E Post ${stamp}`,
    status: "draft",
    excerpt: "Created by the end-to-end check.",
  });
  report("post can be unpublished", unpublished.json?.data?.status === "draft");

  const afterUnpublish = await fetch(`${BASE}/blog`).then((r) => r.text());
  report(
    "unpublished post leaves the site",
    !afterUnpublish.includes(`ZZ E2E Post ${stamp}`),
  );

  /* ----------------------------- cleanup ---------------------------- */
  const removed = await Promise.all([
    api("DELETE", `/posts/${post.json.data._id}`),
    api("DELETE", `/posts/${draft.json.data._id}`),
    api("DELETE", `/pages/${page.json.data._id}`),
  ]);
  report("test records removed", removed.every((r) => r.status === 200));

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("\nE2E crashed:", err);
  process.exit(1);
});
