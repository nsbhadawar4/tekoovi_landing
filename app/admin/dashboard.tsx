"use client";

import { useRouter } from "next/navigation";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  Eye,
  EyeOff,
  ExternalLink,
  Factory,
  FileText,
  FolderKanban,
  Gavel,
  HelpCircle,
  LayoutList,
  type LucideIcon,
  LogOut,
  Mail,
  MessageSquareQuote,
  Newspaper,
  Scale,
  ScrollText,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Trash2,
  TriangleAlert,
  UserRound,
  Workflow,
  Wrench,
  X,
} from "lucide-react";
import {
  type FieldDef,
  getSection,
  type HeaderDef,
  HIDDEN_FIELDS,
  isBlockVisible,
  isToggleable,
  PAGE_BLOCKS,
  SECTIONS,
  type SectionDef,
} from "@/backend/types";
import { API_BASE, apiFetch, apiSend } from "@/lib/api";
import { getIcon, ICON_NAMES } from "@/lib/icons";
import { ImageCropper } from "@/components/ui/image-cropper";

type AdminItem = { id: string } & Record<string, unknown>;
type FormState = Record<string, string | boolean>;
type Toast = { id: number; type: "success" | "error"; message: string };

/* Lucide component for each section's sidebar icon (name -> component). */
const SIDEBAR_ICONS: Record<string, LucideIcon> = {
  LayoutList,
  SlidersHorizontal,
  Sparkles,
  BarChart3,
  Building2,
  FolderKanban,
  Wrench,
  Factory,
  BadgeCheck,
  Workflow,
  Code2,
  FileText,
  TrendingUp,
  MessageSquareQuote,
  Newspaper,
  UserRound,
  HelpCircle,
  Mail,
  Share2,
  ShieldCheck,
  ScrollText,
  Scale,
  Gavel,
};

function subscribeHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
function sectionFromHash(): string {
  if (typeof window === "undefined") return SECTIONS[0].key;
  const key = window.location.hash.replace(/^#/, "");
  return key && getSection(key) ? key : SECTIONS[0].key;
}

function buildForm(
  fields: FieldDef[],
  record?: Record<string, unknown>,
): FormState {
  const form: FormState = {};
  for (const field of fields) {
    const value = record?.[field.name];
    // A switch nobody has touched falls back to the field's default, so
    // "on unless turned off" survives a record that predates the field.
    if (field.type === "boolean")
      form[field.name] =
        value === undefined ? field.default === true : value === true;
    else if (field.type === "tags")
      form[field.name] = Array.isArray(value)
        ? value.join(", ")
        : String(value ?? "");
    else form[field.name] = value == null ? "" : String(value);
  }
  // Which fields are switched off, kept as one comma-joined value so the flat
  // form state (and the JSON body built from it) needs no special shape.
  const hidden = record?.[HIDDEN_FIELDS];
  form[HIDDEN_FIELDS] = Array.isArray(hidden) ? hidden.join(",") : "";
  return form;
}

/** How many fields this record has switched off. */
function hiddenCount(record: Record<string, unknown>): number {
  const hidden = record[HIDDEN_FIELDS];
  return Array.isArray(hidden) ? hidden.length : 0;
}

/**
 * What to show when the request never reached the API at all — the backend is
 * down, the URL is wrong, or CORS rejected it. Without this the UI just spins.
 */
const OFFLINE_MESSAGE = `Can't reach the API at ${API_BASE}. Is the backend running?`;

/** Field names switched off in this form. */
function hiddenIn(form: FormState): string[] {
  return String(form[HIDDEN_FIELDS] ?? "")
    .split(",")
    .filter(Boolean);
}

/* ------------------------- image field ------------------------ */

function ImageField({
  value,
  onChange,
  aspect,
  fit,
  outputWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  aspect?: number;
  fit?: FieldDef["fit"];
  outputWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  function closeCropper() {
    setCropSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setErr("");
    setCropSrc(URL.createObjectURL(file));
  }

  async function handleCrop(dataUrl: string) {
    setErr("");
    closeCropper();
    setUploading(true);
    try {
      const res = await apiSend("/media", "POST", { dataUrl });
      const json = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      onChange(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
      onChange(dataUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div
          className="relative w-full max-w-[200px] shrink-0 overflow-hidden rounded-xl border border-line bg-bg/50 bg-center bg-no-repeat sm:w-40"
          style={{
            aspectRatio: aspect ?? 16 / 10,
            backgroundSize: fit === "contain" ? "contain" : "cover",
            ...(value ? { backgroundImage: `url(${value})` } : {}),
          }}
        >
          {!value && (
            <div className="absolute inset-0 grid place-items-center text-[11px] text-ink-3">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-line bg-white/[0.02] px-3 py-1.5 text-xs text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50"
          >
            {uploading ? "Uploading…" : value ? "Change image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg border border-red-500/30 bg-red-500/[0.04] px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={pickFile}
        className="hidden"
      />
      {err && <p className="mt-2 text-xs text-red-400">{err}</p>}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          fit={fit}
          outputWidth={outputWidth}
          onCancel={closeCropper}
          onCrop={handleCrop}
        />
      )}
    </div>
  );
}

/* ---------------------------- field ---------------------------- */

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | boolean;
  onChange: (v: string | boolean) => void;
}) {
  const base =
    "mt-2 w-full rounded-xl border border-line bg-bg/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow placeholder:text-ink-3/70 focus:focus-ring";

  if (field.type === "image") {
    return (
      <ImageField
        value={String(value ?? "")}
        aspect={field.aspect}
        fit={field.fit}
        outputWidth={field.outputWidth}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-sm text-ink-2">{field.label}</span>
        <BooleanSwitch
          on={value === true}
          label={field.label}
          onChange={onChange}
        />
      </div>
    );
  }

  if (field.type === "icon") {
    return (
      <div className="mt-2 flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-3">
          {createElement(getIcon(String(value || "")), {
            className: "h-4 w-4",
          })}
        </span>
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg/50 px-3.5 py-2.5 text-sm text-ink outline-none transition-shadow focus:focus-ring"
        >
          <option value="">— pick an icon —</option>
          {ICON_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={base}
      >
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={field.placeholder}
        className={base}
      />
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={base}
    />
  );
}

/* ------------------------- switches --------------------------- */

/** The track + knob every switch in the panel is drawn with. */
function SwitchTrack({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative block h-4 w-7 rounded-full transition-colors ${
        on ? "bg-brand" : "bg-white/15"
      }`}
    >
      <span
        className={`absolute top-[3px] block h-2.5 w-2.5 rounded-full bg-white transition-[left] duration-200 ${
          on ? "left-[14px]" : "left-[3px]"
        }`}
      />
    </span>
  );
}

/** Plain on/off switch — used for `boolean` fields. */
function BooleanSwitch({
  on,
  label,
  onChange,
}: {
  on: boolean;
  label: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="inline-flex shrink-0 items-center gap-2 text-[11px] font-medium text-ink-3 transition-colors hover:text-ink-2"
    >
      <span className={on ? "text-brand-3" : ""}>{on ? "On" : "Off"}</span>
      <SwitchTrack on={on} />
    </button>
  );
}

/**
 * Show/hide switch. Off leaves the field (or the whole section) out of the
 * public page without touching the content, so switching it back on restores
 * everything as it was.
 */
function VisibilitySwitch({
  on,
  label,
  onChange,
  what = "field",
}: {
  on: boolean;
  label: string;
  onChange: (on: boolean) => void;
  /** Named in the tooltip: "…switch off to hide this field / section". */
  what?: "field" | "section";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${label} — ${on ? "shown on the site" : "hidden from the site"}`}
      title={
        on
          ? `Shown on the site — switch off to hide this ${what}`
          : `Hidden from the site — switch on to show this ${what}`
      }
      onClick={() => onChange(!on)}
      className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-ink-3 transition-colors hover:text-ink-2"
    >
      {on ? (
        <Eye className="h-3.5 w-3.5 text-brand-3" />
      ) : (
        <EyeOff className="h-3.5 w-3.5" />
      )}
      {/* the word is the first thing to go when space runs out */}
      <span className={`hidden min-[380px]:inline ${on ? "text-brand-3" : ""}`}>
        {on ? "Shown" : "Hidden"}
      </span>
      <SwitchTrack on={on} />
    </button>
  );
}

function FieldRows({
  fields,
  form,
  setForm,
  card = false,
  toggles = true,
}: {
  fields: FieldDef[];
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  /** Wrap each field in its own card (used by the singleton editors). */
  card?: boolean;
  /** Show the per-field show/hide switches (off for site-wide settings). */
  toggles?: boolean;
}) {
  const hidden = hiddenIn(form);

  function setVisible(name: string, visible: boolean) {
    setForm((f) => {
      const next = hiddenIn(f).filter((n) => n !== name);
      if (!visible) next.push(name);
      return { ...f, [HIDDEN_FIELDS]: next.join(",") };
    });
  }

  const renderField = (field: FieldDef) => {
    const canToggle = isToggleable({ noToggles: !toggles }, field);
    const off = canToggle && hidden.includes(field.name);
    return (
      <div key={field.name} className={off ? "opacity-60" : undefined}>
        {(field.type !== "boolean" || canToggle) && (
          <div className="flex items-start justify-between gap-3">
            {field.type !== "boolean" ? (
              <label className="block min-w-0 flex-1 text-xs font-medium leading-relaxed text-ink-3">
                {field.label}
              </label>
            ) : (
              <span />
            )}
            {canToggle && (
              <VisibilitySwitch
                on={!off}
                label={field.label}
                onChange={(v) => setVisible(field.name, v)}
              />
            )}
          </div>
        )}
        <Field
          field={field}
          value={form[field.name] ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
        />
        {off ? (
          <p className="mt-1.5 text-[11px] leading-relaxed text-amber-300/90">
            Hidden — this doesn&apos;t show on the site. The value is kept for
            when you switch it back on.
          </p>
        ) : (
          field.hint && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-3">
              {field.hint}
            </p>
          )
        )}
      </div>
    );
  };

  if (!card) return <>{fields.map(renderField)}</>;

  // Card mode: each field gets its own card, except that consecutive fields
  // sharing a `group` id are wrapped together inside one card.
  const cards: { key: string; group?: string; fields: FieldDef[] }[] = [];
  for (const field of fields) {
    const last = cards[cards.length - 1];
    if (field.group && last?.group === field.group) {
      last.fields.push(field);
    } else {
      cards.push({
        key: field.group ? `g:${field.group}` : `f:${field.name}`,
        group: field.group,
        fields: [field],
      });
    }
  }

  return (
    <>
      {cards.map((c) => (
        <div
          key={c.key}
          className="card-hairline space-y-5 rounded-xl p-4 sm:p-5"
        >
          {c.fields.map(renderField)}
        </div>
      ))}
    </>
  );
}

function HeaderForm({
  header,
  notify,
  onUnauthorized,
}: {
  header: HeaderDef;
  notify: (type: Toast["type"], message: string) => void;
  onUnauthorized: () => void;
}) {
  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch(`/content/${header.key}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { item?: Record<string, unknown> }) => {
        if (!active) return;
        setForm(buildForm(header.fields, data.item ?? {}));
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [header.key, header.fields]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiSend(`/content/${header.key}`, "PUT", form);

      if (res.status === 401) return onUnauthorized();
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = data.error || "Save failed.";
        setError(msg);
        notify("error", msg);
        return;
      }
      notify("success", `${header.singular} saved`);
    } catch {
      setError(OFFLINE_MESSAGE);
      notify("error", OFFLINE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-hairline mt-6 rounded-2xl p-4 sm:p-6">
      <p className="text-sm font-medium text-ink">{header.label}</p>
      {loading ? (
        <div className="mt-4 space-y-4">
          {header.fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-white/[0.06]" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={save} className="mt-4 max-w-2xl space-y-4">
          <FieldRows fields={header.fields} form={form} setForm={setForm} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl btn-brand px-5 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Saving…" : "Save header"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** One entry in the sidebar / mobile section sheet. */
function NavButton({
  section,
  active,
  onSelect,
}: {
  section: SectionDef;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = SIDEBAR_ICONS[section.icon] ?? Sparkles;
  return (
    <button
      onClick={onSelect}
      title={section.onPage}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-brand/15 text-ink ring-1 ring-inset ring-brand/25"
          : "text-ink-3 hover:bg-white/[0.04] hover:text-ink"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-brand-3" : ""}`} />
      <span className="flex min-w-0 flex-col">
        <span className="truncate">{section.label}</span>
        <span
          className={`truncate text-[10px] font-normal ${
            active ? "text-brand-3/70" : "text-ink-3/70"
          }`}
        >
          {section.onPage}
        </span>
      </span>
    </button>
  );
}

/* -------------------------- dashboard -------------------------- */

export default function AdminDashboard() {
  const router = useRouter();
  const section = useSyncExternalStore(
    subscribeHash,
    sectionFromHash,
    () => SECTIONS[0].key,
  );
  const def = useMemo(() => getSection(section) as SectionDef, [section]);
  const isSingle = def.kind === "singleton";
  const imageField = useMemo(
    () => def.fields.find((f) => f.type === "image")?.name,
    [def],
  );

  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Phone-only: the section sheet under the header.
  const [navOpen, setNavOpen] = useState(false);

  // Editor state: null = closed, "new" = adding, otherwise editing that id.
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Which landing-page blocks are switched on. Loaded once and kept here so
  // every section's toolbar can show (and flip) its own block.
  const [blocks, setBlocks] = useState<Record<string, boolean>>({});
  const [blocksLoaded, setBlocksLoaded] = useState(false);

  // Delete confirmation dialog + toast notifications.
  const [pendingDelete, setPendingDelete] = useState<AdminItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const notify = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Manual refresh (used after add / edit / delete on a collection).
  const load = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/content/${key}`, { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        items?: AdminItem[];
      };
      setItems(data.items ?? []);
    } catch {
      setError(OFFLINE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever the active section changes. All state updates happen inside
  // the async continuation (the allowed "callback from an external system"
  // pattern), never synchronously in the effect body.
  useEffect(() => {
    let active = true;
    const d = getSection(section);
    if (!d) return;
    // `loading` is already true here — set by selectSection on change, and by
    // the initial useState on first mount — so we don't set it synchronously.
    apiFetch(`/content/${section}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { items?: AdminItem[]; item?: Record<string, unknown> }) => {
        if (!active) return;
        if (d.kind === "singleton") {
          setForm(buildForm(d.fields, data.item ?? {}));
        } else {
          setItems(data.items ?? []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [section]);

  // Page-section switches: one fetch for the whole panel.
  useEffect(() => {
    let active = true;
    apiFetch("/content/pageSections", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { item?: Record<string, boolean> }) => {
        if (!active) return;
        setBlocks(data.item ?? {});
        setBlocksLoaded(true);
      })
      .catch(() => {
        if (active) setBlocksLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function selectSection(key: string) {
    if (key === section) return;
    setLoading(true);
    setEditing(null);
    setError("");
    // Drives `section` via the hash store above; also survives a refresh.
    // assign() with a hash-only URL just updates the hash (fires hashchange,
    // no reload) — a method call, unlike a direct `location.hash =` assignment.
    window.location.assign(`#${key}`);
  }

  function startAdd() {
    setForm(buildForm(def.fields));
    setError("");
    setEditing("new");
  }

  function startEdit(item: AdminItem) {
    setForm(buildForm(def.fields, item));
    setError("");
    setEditing(item.id);
  }

  function unauthorized() {
    router.replace("/admin/login");
  }

  // Save a collection item (add or edit) via the modal.
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const isNew = editing === "new";
    const path = isNew
      ? `/content/${section}`
      : `/content/${section}/${editing}`;

    try {
      const res = await apiSend(path, isNew ? "POST" : "PUT", form);

      if (res.status === 401) return unauthorized();
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = data.error || "Save failed.";
        setError(msg);
        notify("error", msg);
        return;
      }

      notify("success", `${def.singular} ${isNew ? "added" : "updated"}`);
      setEditing(null);
      load(section);
    } catch {
      setError(OFFLINE_MESSAGE);
      notify("error", OFFLINE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  // Save a singleton section (edit in place).
  async function saveSingleton(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiSend(`/content/${section}`, "PUT", form);

      if (res.status === 401) return unauthorized();
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = data.error || "Save failed.";
        setError(msg);
        notify("error", msg);
        return;
      }
      // The Page Sections editor writes the same record the toolbar switches
      // read, so keep them in step without a refetch.
      if (section === "pageSections") {
        setBlocks(
          Object.fromEntries(def.fields.map((f) => [f.name, form[f.name] === true])),
        );
      }
      notify("success", `${def.singular} saved`);
    } catch {
      setError(OFFLINE_MESSAGE);
      notify("error", OFFLINE_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  // Show/hide a whole landing-page block from the section toolbar. The switch
  // flips straight away and rolls back if the save doesn't land.
  async function setBlockVisible(key: string, on: boolean) {
    const label = PAGE_BLOCKS.find((b) => b.key === key)?.label ?? key;
    const previous = blocks;
    setBlocks({ ...blocks, [key]: on });

    try {
      const res = await apiSend("/content/pageSections", "PUT", { [key]: on });

      if (res.status === 401) return unauthorized();
      if (!res.ok) {
        setBlocks(previous);
        notify("error", `Could not update the ${label} section.`);
        return;
      }
      notify(
        "success",
        on
          ? `${label} section is back on the page`
          : `${label} section is hidden from the page`,
      );
    } catch {
      setBlocks(previous);
      notify("error", OFFLINE_MESSAGE);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    try {
      const res = await apiSend(`/content/${section}/${pendingDelete.id}`, "DELETE");

      if (res.status === 401) return unauthorized();

      setPendingDelete(null);
      if (!res.ok) {
        notify("error", "Could not delete. Please try again.");
        return;
      }
      notify("success", `${def.singular} deleted`);
      load(section);
    } catch {
      notify("error", OFFLINE_MESSAGE);
    } finally {
      setDeleting(false);
    }
  }

  async function logout() {
    // Even if the API can't be reached, get the operator off the panel — the
    // cookie expires on its own and the next page needs a session anyway.
    await apiSend("/admin/login", "DELETE").catch(() => null);
    router.replace("/admin/login");
  }

  const [optimizing, setOptimizing] = useState(false);
  async function optimizeImages() {
    if (optimizing) return;
    setOptimizing(true);
    try {
      const res = await apiSend("/media/migrate", "POST");
      if (res.status === 401) return unauthorized();
      const json = (await res.json().catch(() => ({}))) as {
        replaced?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error || "Migration failed");
      notify(
        "success",
        json.replaced
          ? `Optimised ${json.replaced} image${json.replaced === 1 ? "" : "s"}. Refresh the site to see faster loads.`
          : "All images are already optimised.",
      );
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Migration failed");
    } finally {
      setOptimizing(false);
    }
  }

  const activeIndex = SECTIONS.findIndex((s) => s.key === section);
  const ActiveIcon = SIDEBAR_ICONS[def.icon] ?? Sparkles;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ---------------- sidebar (tablet and up) ---------------- */}
      <aside className="hidden shrink-0 border-line bg-bg-2/50 backdrop-blur-xl md:block md:w-64 md:border-r">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white">
            T
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              Tekoovi Admin
            </p>
            <p className="text-[11px] text-ink-3">Content studio</p>
          </div>
        </div>
        <nav className="flex max-h-[calc(100vh-88px)] flex-col gap-1 overflow-y-auto px-3 pb-4">
          {SECTIONS.map((s) => (
            <NavButton
              key={s.key}
              section={s}
              active={s.key === section}
              onSelect={() => selectSection(s.key)}
            />
          ))}
        </nav>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="min-w-0 flex-1">
        {/* header */}
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg btn-brand font-display text-sm font-bold text-white md:hidden">
                T
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-semibold text-ink md:text-lg">
                  Landing page admin
                </h1>
                <p className="mt-0.5 hidden text-xs text-ink-3 sm:block">
                  Changes show on the site instantly.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={optimizeImages}
                disabled={optimizing}
                title="Move inline images into the cached media store for faster page loads"
                aria-label="Optimize images"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50 sm:px-3"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {optimizing ? "Optimising…" : "Optimize images"}
                </span>
              </button>
              <a
                href="/"
                target="_blank"
                aria-label="View site"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">View site</span>
              </a>
              <button
                onClick={logout}
                aria-label="Log out"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] p-2 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>

          {/* phone: one tap opens the whole section list instead of a
              21-item horizontal scroll strip nobody can navigate */}
          <div className="relative md:hidden">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              className="flex w-full items-center gap-3 border-t border-line px-4 py-3 text-left"
            >
              <ActiveIcon className="h-4 w-4 shrink-0 text-brand-3" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {def.label}
                </span>
                <span className="block truncate text-[11px] text-ink-3">
                  {def.onPage}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] text-ink-3">
                {activeIndex + 1}/{SECTIONS.length}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 ${
                  navOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {navOpen && (
                <motion.nav
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-x-0 top-full z-40 max-h-[62vh] overflow-y-auto border-b border-line bg-bg/95 p-3 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.95)] backdrop-blur-xl"
                >
                  <div className="grid grid-cols-1 gap-1 min-[430px]:grid-cols-2">
                    {SECTIONS.map((s) => (
                      <NavButton
                        key={s.key}
                        section={s}
                        active={s.key === section}
                        onSelect={() => {
                          selectSection(s.key);
                          setNavOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* content */}
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8 md:px-6">
          {/* toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium text-ink">
                {def.label}{" "}
                {!isSingle && (
                  <span className="text-ink-3">({items.length})</span>
                )}
              </h2>
              <p className="mt-0.5 text-xs text-ink-3">
                On page: {def.onPage}
              </p>
              {!def.noToggles && (
                <p className="mt-1 text-xs text-ink-3/80">
                  Switch any field to{" "}
                  <span className="text-ink-2">Hidden</span> to leave it off the
                  page — the value stays saved.
                </p>
              )}
              {/* Whole-section switches for the blocks this section feeds. */}
              {blocksLoaded && def.blocks && def.blocks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {def.blocks.map((key) => {
                    const block = PAGE_BLOCKS.find((b) => b.key === key);
                    const label = block?.label ?? key;
                    return (
                      <div
                        key={key}
                        className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3 py-2 sm:w-auto sm:justify-start"
                        title={block?.hint}
                      >
                        <span className="min-w-0 truncate text-xs text-ink-2">
                          {label} section
                        </span>
                        <VisibilitySwitch
                          on={isBlockVisible(blocks, key)}
                          label={`${label} section`}
                          what="section"
                          onChange={(v) => setBlockVisible(key, v)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {!isSingle && (
              <button
                onClick={startAdd}
                className="w-full shrink-0 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 sm:w-auto sm:py-2"
              >
                + Add new
              </button>
            )}
          </div>

          {/* ------------------- singleton editor ------------------- */}
          {isSingle ? (
            <div className="mt-6 card-hairline space-y-5 rounded-xl p-3 sm:p-5">
              {loading ? (
                <div className="card-hairline space-y-4 rounded-2xl p-4 sm:p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                      <div className="h-9 w-full animate-pulse rounded-lg bg-white/[0.06]" />
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={saveSingleton} className="max-w-2xl space-y-4">
                  <FieldRows
                    fields={def.fields}
                    form={form}
                    setForm={setForm}
                    card
                    toggles={!def.noToggles}
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full rounded-xl btn-brand px-5 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ------------------- collection list ------------------- */
            <>
              {def.header && (
                <>
                  <HeaderForm
                    key={def.header.key}
                    header={def.header}
                    notify={notify}
                    onUnauthorized={unauthorized}
                  />
                  <p className="mt-8 text-sm font-medium text-ink">
                    {def.singular}s{" "}
                    <span className="text-ink-3">({items.length})</span>
                  </p>
                </>
              )}
              <div className={def.header ? "mt-3 space-y-2" : "mt-4 space-y-2"}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="card-hairline flex items-center justify-between gap-4 rounded-xl p-4"
                    >
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <div className="h-3.5 w-1/3 animate-pulse rounded bg-white/10" />
                        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <div className="h-7 w-12 animate-pulse rounded-lg bg-white/[0.06]" />
                        <div className="h-7 w-14 animate-pulse rounded-lg bg-white/[0.06]" />
                      </div>
                    </div>
                  ))
                ) : items.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink-3">
                    Nothing here yet. Click “Add new”.
                  </p>
                ) : (
                  items.map((item) => {
                    const title = String(
                      (def.titleField && item[def.titleField]) ?? "(untitled)",
                    );
                    const img = imageField
                      ? String(item[imageField] ?? "")
                      : "";
                    return (
                      <div
                        key={item.id}
                        className="card-hairline flex flex-wrap items-center gap-3 rounded-xl p-3 transition-colors hover:border-white/15 sm:flex-nowrap sm:gap-4 sm:p-4"
                      >
                        {imageField && (
                          <div
                            className="relative aspect-[16/10] w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-bg-2 bg-cover bg-center sm:w-28"
                            style={
                              img
                                ? { backgroundImage: `url(${img})` }
                                : undefined
                            }
                          >
                            {!img && (
                              <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold text-ink/15">
                                {title.charAt(0)}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 basis-40">
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-ink">
                            <span className="min-w-0 truncate">{title}</span>
                            {hiddenCount(item) > 0 && (
                              <span
                                title="Fields switched off for this item"
                                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-200"
                              >
                                <EyeOff className="h-3 w-3" />
                                {hiddenCount(item)} hidden
                              </span>
                            )}
                          </p>
                          {def.subField && (
                            <p className="truncate text-xs text-ink-3">
                              {String(item[def.subField] ?? "")}
                            </p>
                          )}
                        </div>
                        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                          <button
                            onClick={() => startEdit(item)}
                            className="flex-1 rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-xs text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:flex-none sm:py-1.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setPendingDelete(item)}
                            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/[0.04] px-3 py-2 text-xs text-red-300 transition-colors hover:bg-red-500/10 sm:flex-none sm:py-1.5"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* editor modal (collections only) */}
      {!isSingle && editing !== null && (
        // Bottom sheet on a phone, centred dialog from `sm` up. The action bar
        // is pinned so Save is always reachable in a long form.
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={save}
            className="card-elevated flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl sm:max-h-[90vh] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <h3 className="truncate text-base font-semibold text-ink sm:text-lg">
                {editing === "new" ? "Add" : "Edit"} {def.singular}
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              <FieldRows
                fields={def.fields}
                form={form}
                setForm={setForm}
                toggles={!def.noToggles}
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex gap-3 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink sm:flex-none sm:py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:flex-none sm:py-2"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* delete confirmation dialog */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            className="fixed inset-0 z-[70] grid place-items-center bg-bg/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="card-elevated w-full max-w-sm rounded-2xl p-6 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-500/10">
                <TriangleAlert className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">
                Delete this {def.singular.toLowerCase()}?
              </h3>
              <p className="mt-1 text-sm text-ink-3">
                “
                {String(
                  (def.titleField && pendingDelete[def.titleField]) ??
                    "this item",
                )}
                ” will be permanently removed. This can&apos;t be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  disabled={deleting}
                  className="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* toast notifications */}
      <div className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-full sm:max-w-xs">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
                t.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              )}
              <p className="flex-1 text-sm text-ink">{t.message}</p>
              <button
                onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))}
                className="text-ink-3 transition-colors hover:text-ink"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
