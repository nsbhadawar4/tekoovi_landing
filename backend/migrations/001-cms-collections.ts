/**
 * Moves the existing site onto the CMS collections.
 *
 * Everything here is additive and idempotent:
 *   - the `content.landing` document is never modified or deleted, so the
 *     landing page keeps rendering from it exactly as before
 *   - each step skips work already done, so re-running is safe
 *   - blog slugs are preserved, so /blog/<slug> URLs do not change
 *
 * Run with:  npm run cms:migrate
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

// Next reads .env.local automatically; a plain script has to be told. Both are
// loaded so the migration works however the project is configured.
loadEnv({ path: ".env.local" });
loadEnv();
import { connectDB } from "@/backend/lib/mongodb";
import { hashPassword } from "@/backend/lib/password";
import { ContentModel } from "@/backend/models/content.model";
import { MediaModel } from "@/backend/models/media.model";
import { MenuModel } from "@/backend/models/menu.model";
import { PostModel } from "@/backend/models/post.model";
import { SettingModel } from "@/backend/models/setting.model";
import { TermModel } from "@/backend/models/term.model";
import { UserModel } from "@/backend/models/user.model";
import { slugify } from "@/lib/utils";

type Row = Record<string, unknown>;

const log = (step: string, detail: string) =>
  console.log(`  ${step.padEnd(22)} ${detail}`);

/** The landing document, or an empty object on a fresh install. */
async function landingData(): Promise<Row> {
  const doc = await ContentModel.findOne({ key: "landing" }).lean();
  return ((doc?.data as Row) ?? {}) as Row;
}

/* ------------------------------ users ------------------------------ */

async function seedAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || "tekoovi@gmail.com").toLowerCase();

  if (await UserModel.exists({ email })) {
    return log("admin user", `already exists (${email})`);
  }

  await UserModel.create({
    email,
    name: "Administrator",
    passwordHash: await hashPassword(process.env.ADMIN_PASSWORD || "admin123"),
    role: "admin",
  });
  log("admin user", `created (${email})`);
}

/* ------------------------------ posts ------------------------------ */

async function migrateBlogs(data: Row): Promise<void> {
  const blogs = (data.blogs as Row[]) ?? [];
  if (blogs.length === 0) return log("posts", "no blogs to migrate");

  let created = 0;

  for (const blog of blogs) {
    // The old site derived the URL from the title, falling back to the id.
    // Reusing that exact rule is what keeps existing links alive.
    const slug = slugify(String(blog.title ?? ""), String(blog.id ?? ""));
    if (await PostModel.exists({ slug })) continue;

    const gallery = [blog.image1, blog.image2, blog.image3]
      .map((image) => String(image ?? "").trim())
      .filter(Boolean);

    await PostModel.create({
      title: String(blog.title ?? "Untitled"),
      slug,
      // Anything already on the live site is, by definition, published.
      status: "published",
      excerpt: String(blog.excerpt ?? ""),
      content: String(blog.content ?? ""),
      featuredImage: String(blog.coverImage ?? ""),
      gallery,
      categories: blog.category ? [String(blog.category)] : [],
      tags: Array.isArray(blog.tags) ? blog.tags.map(String) : [],
      authorName: String(blog.author ?? ""),
      readTime: String(blog.readTime ?? ""),
      publishedAt: new Date(),
      seo: {},
    });
    created += 1;
  }

  log("posts", `${created} created, ${blogs.length - created} already present`);
}

/* ------------------------------ terms ------------------------------ */

async function migrateTerms(data: Row): Promise<void> {
  const blogs = (data.blogs as Row[]) ?? [];
  const categories = new Set<string>();
  const tags = new Set<string>();

  for (const blog of blogs) {
    if (blog.category) categories.add(String(blog.category));
    for (const tag of (blog.tags as string[]) ?? []) tags.add(String(tag));
  }

  let created = 0;

  for (const [type, names] of [
    ["category", categories],
    ["tag", tags],
  ] as const) {
    for (const name of names) {
      const slug = slugify(name, name.toLowerCase());
      if (await TermModel.exists({ type, slug })) continue;
      await TermModel.create({ type, name, slug, description: "" });
      created += 1;
    }
  }

  log(
    "terms",
    `${created} created (${categories.size} categories, ${tags.size} tags)`,
  );
}

/* ------------------------------ menus ------------------------------ */

/** The nav that was hardcoded in frontend/lib/data.ts, now editable. */
const HEADER_ITEMS = [
  { label: "Home", url: "#home", block: "hero" },
  { label: "Work", url: "#work", block: "work" },
  { label: "Services", url: "#services", block: "services" },
  { label: "Process", url: "#process", block: "process" },
  { label: "Studio", url: "#studio", block: "founder" },
  { label: "Blog", url: "#blog", block: "blog" },
  { label: "FAQ", url: "#faq", block: "faq" },
];

async function seedMenus(): Promise<void> {
  const menus = [
    { location: "header" as const, name: "Header menu", items: HEADER_ITEMS },
    {
      location: "footer" as const,
      name: "Footer menu",
      items: [...HEADER_ITEMS, { label: "Case studies", url: "/#work", block: "work" }],
    },
  ];

  for (const menu of menus) {
    if (await MenuModel.exists({ location: menu.location })) {
      log(`${menu.location} menu`, "already exists");
      continue;
    }

    await MenuModel.create({
      name: menu.name,
      location: menu.location,
      items: menu.items.map((item, order) => ({
        ...item,
        order,
        newTab: false,
        active: true,
      })),
    });
    log(`${menu.location} menu`, `seeded with ${menu.items.length} items`);
  }
}

/* ---------------------------- settings ----------------------------- */

async function seedSettings(data: Row): Promise<void> {
  const contact = (data.contact as Row) ?? {};
  const settings = (data.settings as Row) ?? {};
  const socials = (data.socials as Row[]) ?? [];

  const groups: Record<string, Row> = {
    general: {
      siteName: "Tekoovi",
      tagline: "We build digital products that scale businesses.",
      logo: String(settings.logoImage ?? ""),
      favicon: "",
    },
    contact: {
      email: String(contact.email ?? ""),
      phone: "",
      whatsapp: String(contact.whatsapp ?? ""),
      calendly: String(contact.calendly ?? ""),
      address: "",
      socials: socials.map((social) => ({
        label: social.label,
        href: social.href,
      })),
    },
    seo: {
      defaultTitle: "Tekoovi — Digital Product Studio",
      defaultDescription:
        "Tekoovi is a premium digital product studio. We design and engineer scalable websites, SaaS platforms, AI solutions and mobile apps.",
      ogImage: "",
    },
    footer: {
      description:
        "A premium digital product studio building scalable websites, SaaS, AI and mobile products for ambitious founders and teams.",
      copyright: "© {year} Tekoovi. All rights reserved.",
    },
  };

  let created = 0;

  for (const [group, groupData] of Object.entries(groups)) {
    if (await SettingModel.exists({ group })) continue;
    await SettingModel.create({ group, data: groupData });
    created += 1;
  }

  log("settings", `${created} groups created, ${4 - created} already present`);
}

/* ----------------------------- media ------------------------------- */

/** Backfills the library fields on images uploaded before they existed. */
async function backfillMedia(): Promise<void> {
  const stale = await MediaModel.find({
    $or: [{ filename: { $in: ["", null] } }, { size: { $in: [0, null] } }],
  });

  for (const item of stale) {
    const extension = (item.contentType || "image/jpeg").split("/")[1] || "jpg";
    item.filename ||= `image-${String(item._id).slice(-8)}.${extension}`;
    item.size ||= item.data?.length ?? 0;
    await item.save();
  }

  log("media backfill", `${stale.length} documents updated`);
}

/* ------------------------------ run -------------------------------- */

async function run(): Promise<void> {
  console.log("\nCMS migration — nothing is deleted, every step is repeatable\n");
  await connectDB();

  const data = await landingData();
  await seedAdmin();
  await migrateBlogs(data);
  await migrateTerms(data);
  await seedMenus();
  await seedSettings(data);
  await backfillMedia();

  await mongoose.disconnect();
  console.log("\nDone. The landing document was left untouched.\n");
}

run().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
