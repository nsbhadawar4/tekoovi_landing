import * as repo from "@/backend/repository/content.repository";
import {
  getSection,
  isSectionKey,
  isSingleton,
  type ContentData,
  type ContentItem,
  type FieldDef,
} from "@/backend/types";

/* -------------------------------------------------------------- */
/*  Content controller — validation + business logic.             */
/*  API routes and the landing page call THIS, not the repository  */
/*  directly.                                                      */
/* -------------------------------------------------------------- */

export function isSection(value: string): boolean {
  return isSectionKey(value);
}

export function sectionIsSingleton(value: string): boolean {
  return isSingleton(value);
}

/** Coerce one incoming value to the type declared for its field. */
function coerce(field: FieldDef, value: unknown): unknown {
  switch (field.type) {
    case "tags":
      return Array.isArray(value)
        ? value.map((v) => String(v).trim()).filter(Boolean)
        : String(value)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
    case "boolean":
      return value === true || value === "true" || value === "on";
    case "number": {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    default:
      return String(value ?? "").trim();
  }
}

/** Keep only known fields for a section and coerce their types. */
function sanitize(
  section: string,
  body: Record<string, unknown>,
): Record<string, unknown> {
  const def = getSection(section);
  const out: Record<string, unknown> = {};
  if (!def) return out;

  for (const field of def.fields) {
    const value = body[field.name];
    if (value === undefined) continue;
    out[field.name] = coerce(field, value);
  }
  return out;
}

/** At least one meaningful value must be present when creating. */
function hasContent(fields: Record<string, unknown>): boolean {
  return Object.values(fields).some((v) =>
    Array.isArray(v)
      ? v.length > 0
      : typeof v === "boolean"
        ? false
        : typeof v === "number"
          ? true
          : String(v ?? "").length > 0,
  );
}

/* --------------------------- reads ---------------------------- */

/** Full content object for the landing page. */
export async function getContent(): Promise<ContentData> {
  return repo.getAll();
}

/** Collection: list its items. Singleton callers use getSingleton instead. */
export async function listSection(section: string): Promise<ContentItem[]> {
  return repo.readSection(section);
}

/** Singleton: read the single record. */
export async function getSingleton(
  section: string,
): Promise<Record<string, unknown>> {
  return repo.readSingleton(section);
}

/* --------------------------- writes --------------------------- */

export async function createItem(
  section: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; item: ContentItem } | { ok: false; error: string }> {
  if (isSingleton(section)) {
    return { ok: false, error: "This section can't add items." };
  }
  const fields = sanitize(section, body);
  if (!hasContent(fields)) {
    return { ok: false, error: "Please fill at least one field." };
  }
  const item = await repo.addItem(section, fields);
  return { ok: true, item };
}

export async function editItem(
  section: string,
  id: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; item: ContentItem } | { ok: false; error: string }> {
  const fields = sanitize(section, body);
  const item = await repo.updateItem(section, id, fields);
  if (!item) return { ok: false, error: "Item not found." };
  return { ok: true, item };
}

export async function deleteItem(
  section: string,
  id: string,
): Promise<{ ok: boolean }> {
  if (isSingleton(section)) return { ok: false };
  const ok = await repo.removeItem(section, id);
  return { ok };
}

/** Singleton: replace/merge the single record. */
export async function editSingleton(
  section: string,
  body: Record<string, unknown>,
): Promise<
  { ok: true; item: Record<string, unknown> } | { ok: false; error: string }
> {
  if (!isSingleton(section)) {
    return { ok: false, error: "This section isn't editable in place." };
  }
  const fields = sanitize(section, body);
  const item = await repo.updateSingleton(section, fields);
  return { ok: true, item };
}
