import { promises as fs } from "fs";
import path from "path";
import {
  type ContentData,
  type ContentItem,
  isSingleton,
} from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Content repository — JSON file store.                          */
/*                                                                 */
/*  This is the ONLY file that knows *where* content lives. When   */
/*  MongoDB is added, replace the bodies below with Mongoose       */
/*  queries — the exported function signatures stay the same, so   */
/*  controllers / API routes / admin UI need no changes.           */
/*                                                                 */
/*  Sections come in two shapes (see backend/types.ts):            */
/*   • collection — an array of items with ids (add/edit/delete)   */
/*   • singleton  — a single object (edit only)                    */
/* -------------------------------------------------------------- */

const FILE = path.join(process.cwd(), "backend", "data", "content.json");

async function readAll(): Promise<ContentData> {
  const raw = await fs.readFile(FILE, "utf-8");
  return JSON.parse(raw) as ContentData;
}

async function writeAll(data: ContentData): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

function genId(): string {
  return (
    "x" +
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-4)
  );
}

/** Whole content object (used by the landing page). */
export async function getAll(): Promise<ContentData> {
  return readAll();
}

/* -------------------------- collections ----------------------- */

/** All items in one collection section. */
export async function readSection(section: string): Promise<ContentItem[]> {
  const data = await readAll();
  return ((data as Record<string, unknown>)[section] as ContentItem[]) ?? [];
}

/** Append a new item (an `id` is assigned here). */
export async function addItem(
  section: string,
  fields: Record<string, unknown>,
): Promise<ContentItem> {
  const data = await readAll();
  const created = { ...fields, id: genId() } as ContentItem;
  const store = data as Record<string, unknown>;
  const list = (store[section] as ContentItem[]) ?? [];
  list.push(created);
  store[section] = list;
  await writeAll(data);
  return created;
}

/** Patch an existing item by id. Returns the updated item, or null if missing. */
export async function updateItem(
  section: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<ContentItem | null> {
  const data = await readAll();
  const list = (data as Record<string, unknown>)[section] as ContentItem[];
  if (!Array.isArray(list)) return null;
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...fields, id } as ContentItem;
  await writeAll(data);
  return list[idx];
}

/** Delete an item by id. Returns true if something was removed. */
export async function removeItem(
  section: string,
  id: string,
): Promise<boolean> {
  const data = await readAll();
  const list = (data as Record<string, unknown>)[section] as ContentItem[];
  if (!Array.isArray(list)) return false;
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  list.splice(idx, 1);
  await writeAll(data);
  return true;
}

/* -------------------------- singletons ------------------------ */

/** The single record for a singleton section. */
export async function readSingleton(
  section: string,
): Promise<Record<string, unknown>> {
  const data = await readAll();
  return ((data as Record<string, unknown>)[section] as Record<
    string,
    unknown
  >) ?? {};
}

/** Merge new field values into a singleton record and persist it. */
export async function updateSingleton(
  section: string,
  fields: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const data = await readAll();
  const store = data as Record<string, unknown>;
  const current = (store[section] as Record<string, unknown>) ?? {};
  const merged = { ...current, ...fields };
  store[section] = merged;
  await writeAll(data);
  return merged;
}

/** Convenience: is this key stored as a single object? */
export { isSingleton };
