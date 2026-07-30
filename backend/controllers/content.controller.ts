import { cache } from "react";
import * as repo from "@/backend/repository/content.repository";
import {
  getSection,
  HIDDEN_FIELDS,
  isSectionKey,
  isSingleton,
  isToggleable,
  SECTION_KEYS,
  type ContentData,
  type ContentItem,
  type FieldDef,
  type Hideable,
  type SectionDef,
} from "@/backend/types";

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

/**
 * Normalise an incoming hidden-field list.
 *
 * The admin sends a comma-joined string (its form values are flat); an array is
 * accepted too. Unknown names and fields that have no switch are dropped, so a
 * crafted request can't hide something the admin UI can't restore.
 */
function coerceHidden(def: SectionDef, value: unknown): string[] {
  const names = Array.isArray(value)
    ? value
    : String(value ?? "").split(",");
  const switchable = new Set(
    def.fields.filter((f) => isToggleable(def, f)).map((f) => f.name),
  );
  return names.map((n) => String(n).trim()).filter((n) => switchable.has(n));
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
  if (body[HIDDEN_FIELDS] !== undefined && !def.noToggles) {
    out[HIDDEN_FIELDS] = coerceHidden(def, body[HIDDEN_FIELDS]);
  }
  return out;
}

/** The editable values only — visibility flags aren't content. */
function contentValues(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(([key]) => key !== HIDDEN_FIELDS),
  );
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

/* ---------------------- field visibility ---------------------- */

/**
 * The stand-in for a field switched off in the admin.
 *
 * Blank values are what every section already renders nothing for, so hiding a
 * field needs no special case on the page. Numbers keep their value — 0 is a
 * real stat, so the components that render one check `isHidden` instead.
 */
function blank(field: FieldDef, value: unknown): unknown {
  switch (field.type) {
    case "tags":
      return [];
    case "boolean":
      return false;
    case "number":
      return value;
    default:
      return "";
  }
}

/**
 * Blank out one record's hidden fields. `hiddenFields` itself stays on the
 * record — a few components need to tell "hidden" from "empty", because their
 * blank value has a fallback of its own.
 */
function applyHidden<T>(def: SectionDef, record: T): T {
  const hidden = (record as Hideable | null)?.hiddenFields;
  if (!hidden?.length) return record;

  const out = { ...(record as Record<string, unknown>) };
  for (const field of def.fields) {
    if (hidden.includes(field.name) && field.name in out) {
      out[field.name] = blank(field, out[field.name]);
    }
  }
  return out as T;
}

/** Same, across the whole content document (collections and singletons). */
function applyVisibility(data: ContentData): ContentData {
  const out = { ...data } as unknown as Record<string, unknown>;
  for (const key of SECTION_KEYS) {
    const def = getSection(key);
    const value = out[key];
    if (!def || !value || typeof value !== "object") continue;
    out[key] = Array.isArray(value)
      ? value.map((item) => applyHidden(def, item))
      : applyHidden(def, value);
  }
  return out as unknown as ContentData;
}

/* --------------------------- reads ---------------------------- */

/**
 * Full content object for the landing page, with every field switched off in
 * the admin blanked out — hidden content never reaches the browser.
 *
 * Wrapped in React `cache()` so the many callers in a single request — the
 * site layout, the page, and its generateMetadata — all share ONE database
 * read instead of each firing their own round trip. Dedup is per-request, so
 * admin edits still show on the very next request.
 *
 * Writers (the admin API, the image migration) go through the repository
 * directly, so they still see and save the untouched values.
 */
export const getContent = cache(
  async (): Promise<ContentData> => applyVisibility(await repo.getAll()),
);

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
  if (!hasContent(contentValues(fields))) {
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
