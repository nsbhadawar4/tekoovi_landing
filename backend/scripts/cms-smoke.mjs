/**
 * End-to-end smoke test for the CMS API.
 *
 * Hits the running dev server the same way the admin panel does — logs in,
 * exercises every module, and cleans up everything it created. Existing content
 * is only ever read.
 *
 *   node backend/scripts/cms-smoke.mjs [baseUrl]
 */

const BASE = process.argv[2] || "http://localhost:3000";
const API = `${BASE}/api/cms`;

let cookie = "";
let passed = 0;
let failed = 0;

function report(name, ok, detail = "") {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  ok ? (passed += 1) : (failed += 1);
}

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* an HTML error page — leave json null and let the caller report it */
  }
  return { status: res.status, json, text };
}

async function login() {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL || "tekoovi@gmail.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
    }),
  });

  const raw = res.headers.getSetCookie?.() ?? [];
  cookie = raw.map((c) => c.split(";")[0]).join("; ");
  report("admin login", res.ok && cookie.includes("admin_session"));
}

async function run() {
  console.log(`\nCMS smoke test against ${BASE}\n`);
  await login();

  /* ------------------------------ auth ------------------------------ */
  const saved = cookie;
  cookie = "";
  const guarded = await call("GET", "/posts");
  report("protected route rejects anonymous", guarded.status === 401);
  cookie = saved;

  /* ---------------------------- dashboard --------------------------- */
  const dash = await call("GET", "/dashboard");
  report(
    "dashboard counts",
    dash.json?.success === true && typeof dash.json.data.counts.posts === "number",
    `${dash.json?.data?.counts?.posts} posts, ${dash.json?.data?.counts?.media} media`,
  );

  /* ------------------------------ posts ----------------------------- */
  const created = await call("POST", "/posts", {
    title: "ZZ Smoke Post",
    status: "draft",
    excerpt: "temporary",
    content: "<p>Body</p><script>alert(1)</script>",
    categories: ["Engineering"],
    tags: ["smoke"],
  });
  const postId = created.json?.data?._id;
  report("post create", created.status === 201 && Boolean(postId));
  report(
    "post content sanitised",
    created.json?.data?.content === "<p>Body</p>",
    created.json?.data?.content,
  );
  report("post slug generated", created.json?.data?.slug === "zz-smoke-post");

  const invalid = await call("POST", "/posts", { title: "" });
  report(
    "post validation",
    invalid.status === 422 && Boolean(invalid.json?.errors?.title),
  );

  const published = await call("PUT", `/posts/${postId}`, {
    title: "ZZ Smoke Post",
    status: "published",
    excerpt: "temporary",
  });
  report(
    "post publish sets date",
    published.json?.data?.status === "published" &&
      Boolean(published.json?.data?.publishedAt),
  );

  const search = await call("GET", "/posts?search=ZZ%20Smoke&status=published");
  report("post search + filter", (search.json?.data ?? []).length === 1);

  const badId = await call("GET", "/posts/not-a-real-id");
  report("bad id is 404 not 500", badId.status === 404);

  /* ------------------------------ pages ----------------------------- */
  const page = await call("POST", "/pages", {
    title: "ZZ Smoke Page",
    status: "published",
    content: "<p>Page</p>",
  });
  const pageId = page.json?.data?._id;
  report("page create", page.status === 201 && Boolean(pageId));

  /* ------------------------------ terms ----------------------------- */
  const term = await call("POST", "/terms", {
    name: "ZZ Smoke Category",
    type: "category",
  });
  const termId = term.json?.data?._id;
  report("term create", term.status === 201 && Boolean(termId));

  const duplicate = await call("POST", "/terms", {
    name: "ZZ Smoke Category",
    type: "category",
  });
  report("duplicate slug rejected", duplicate.status === 422);

  const terms = await call("GET", "/terms?type=category");
  const used = (terms.json?.data ?? []).find((t) => t.postCount > 0);
  report("term post counts", Boolean(used), used ? `${used.name}: ${used.postCount}` : "");

  if (used) {
    const blocked = await call("DELETE", `/terms/${used._id}`);
    report("in-use term cannot be deleted", blocked.status === 409);
  }

  /* ------------------------------ menus ----------------------------- */
  const menus = await call("GET", "/menus");
  const header = (menus.json?.data ?? []).find((m) => m.location === "header");
  report("menus load", Boolean(header), `${header?.items?.length} header items`);

  /* ---------------------------- settings ---------------------------- */
  const settings = await call("GET", "/settings");
  report(
    "settings groups",
    Boolean(settings.json?.data?.general && settings.json?.data?.contact),
  );

  /* ------------------------------ media ----------------------------- */
  const pixel =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  const upload = await call("POST", "/media", {
    dataUrl: pixel,
    filename: "../../evil name!.png",
    alt: "smoke pixel",
  });
  const mediaId = upload.json?.data?._id;
  report("media upload", upload.status === 201 && Boolean(mediaId));
  report(
    "filename sanitised",
    upload.json?.data?.filename === "evil-name.png",
    upload.json?.data?.filename,
  );

  const badType = await call("POST", "/media", {
    dataUrl: "data:text/html;base64,PHNjcmlwdD4=",
  });
  report("non-image upload rejected", badType.status === 422);

  const served = await fetch(`${BASE}/api/media/${mediaId}`);
  report(
    "media URL serves the file",
    served.ok && served.headers.get("content-type") === "image/png",
  );

  /* ----------------------------- cleanup ---------------------------- */
  const cleanup = await Promise.all([
    call("DELETE", `/posts/${postId}`),
    call("DELETE", `/pages/${pageId}`),
    call("DELETE", `/terms/${termId}`),
    call("DELETE", `/media/${mediaId}`),
  ]);
  report("cleanup removed every test record", cleanup.every((r) => r.status === 200));

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("\nSmoke test crashed:", err);
  process.exit(1);
});
