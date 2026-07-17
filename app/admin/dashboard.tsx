"use client";

import { useRouter } from "next/navigation";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  CircleAlert,
  Code2,
  ExternalLink,
  Factory,
  FileText,
  FolderKanban,
  Gavel,
  HelpCircle,
  type LucideIcon,
  LogOut,
  Mail,
  MessageSquareQuote,
  Scale,
  ScrollText,
  Share2,
  ShieldCheck,
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
  SECTIONS,
  type SectionDef,
} from "@/backend/types";
import { getIcon, ICON_NAMES } from "@/lib/icons";
import { ImageCropper } from "@/components/ui/image-cropper";

type AdminItem = { id: string } & Record<string, unknown>;
type FormState = Record<string, string | boolean>;
type Toast = { id: number; type: "success" | "error"; message: string };

/* Lucide component for each section's sidebar icon (name -> component). */
const SIDEBAR_ICONS: Record<string, LucideIcon> = {
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
  UserRound,
  HelpCircle,
  Mail,
  Share2,
  ShieldCheck,
  ScrollText,
  Scale,
  Gavel,
};

function buildForm(def: SectionDef, record?: Record<string, unknown>): FormState {
  const form: FormState = {};
  for (const field of def.fields) {
    const value = record?.[field.name];
    if (field.type === "boolean") form[field.name] = value === true;
    else if (field.type === "tags")
      form[field.name] = Array.isArray(value)
        ? value.join(", ")
        : String(value ?? "");
    else form[field.name] = value == null ? "" : String(value);
  }
  return form;
}

/* ------------------------- image field ------------------------ */

function ImageField({
  value,
  onChange,
  aspect,
  outputWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  aspect?: number;
  outputWidth?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [err, setErr] = useState("");

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

  function handleCrop(dataUrl: string) {
    setErr("");
    onChange(dataUrl);
    closeCropper();
  }

  return (
    <div className="mt-2">
      <div className="flex items-center gap-4">
        <div
          className="relative w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40 bg-cover bg-center"
          style={{
            aspectRatio: aspect ?? 16 / 10,
            ...(value ? { backgroundImage: `url(${value})` } : {}),
          }}
        >
          {!value && (
            <div className="absolute inset-0 grid place-items-center text-[11px] text-white/30">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
          >
            {value ? "Change image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
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
    "mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-white/30";

  if (field.type === "image") {
    return (
      <ImageField
        value={String(value ?? "")}
        aspect={field.aspect}
        outputWidth={field.outputWidth}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="mt-2 flex items-center gap-2.5 text-sm text-white/80">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        {field.label}
      </label>
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
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
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

function FieldRows({
  def,
  form,
  setForm,
}: {
  def: SectionDef;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) {
  return (
    <>
      {def.fields.map((field) => (
        <div key={field.name}>
          {field.type !== "boolean" && (
            <label className="block text-xs font-medium text-white/60">
              {field.label}
            </label>
          )}
          <Field
            field={field}
            value={form[field.name] ?? ""}
            onChange={(v) => setForm((f) => ({ ...f, [field.name]: v }))}
          />
        </div>
      ))}
    </>
  );
}

/* -------------------------- dashboard -------------------------- */

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<string>(SECTIONS[0].key);
  const def = useMemo(() => getSection(section) as SectionDef, [section]);
  const isSingle = def.kind === "singleton";
  // If this section has an image field, show a thumbnail in each list row.
  const imageField = useMemo(
    () => def.fields.find((f) => f.type === "image")?.name,
    [def],
  );

  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor state: null = closed, "new" = adding, otherwise editing that id.
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    const res = await fetch(`/api/content/${key}`, { cache: "no-store" });
    const data = (await res.json().catch(() => ({}))) as { items?: AdminItem[] };
    setItems(data.items ?? []);
    setLoading(false);
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
    fetch(`/api/content/${section}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { items?: AdminItem[]; item?: Record<string, unknown> }) => {
        if (!active) return;
        if (d.kind === "singleton") {
          setForm(buildForm(d, data.item ?? {}));
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

  function selectSection(key: string) {
    if (key === section) return;
    setLoading(true);
    setEditing(null);
    setError("");
    setSection(key);
  }

  function startAdd() {
    setForm(buildForm(def));
    setError("");
    setEditing("new");
  }

  function startEdit(item: AdminItem) {
    setForm(buildForm(def, item));
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
    const url = isNew
      ? `/api/content/${section}`
      : `/api/content/${section}/${editing}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
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
  }

  // Save a singleton section (edit in place).
  async function saveSingleton(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch(`/api/content/${section}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (res.status === 401) return unauthorized();
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      const msg = data.error || "Save failed.";
      setError(msg);
      notify("error", msg);
      return;
    }
    notify("success", `${def.singular} saved`);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/content/${section}/${pendingDelete.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.status === 401) return unauthorized();

    setPendingDelete(null);
    if (!res.ok) {
      notify("error", "Could not delete. Please try again.");
      return;
    }
    notify("success", `${def.singular} deleted`);
    load(section);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* sidebar */}
      <aside className="shrink-0 border-b border-white/10 md:w-64 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-white">Tekoovi Admin</p>
          <p className="mt-0.5 text-xs text-white/40">Landing page content</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:max-h-[calc(100vh-88px)] md:flex-col md:overflow-y-auto md:pb-4">
          {SECTIONS.map((s) => {
            const Icon = SIDEBAR_ICONS[s.icon] ?? Sparkles;
            const active = s.key === section;
            return (
              <button
                key={s.key}
                onClick={() => selectSection(s.key)}
                title={s.onPage}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{s.label}</span>
                  <span
                    className={`hidden truncate text-[10px] font-normal md:block ${
                      active ? "text-black/50" : "text-white/30"
                    }`}
                  >
                    {s.onPage}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1">
        {/* header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
          <div>
            <h1 className="text-lg font-semibold text-white">Landing page admin</h1>
            <p className="mt-0.5 text-xs text-white/40">
              Changes show on the site instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View site</span>
            </a>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        {/* content */}
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-6">
          {/* toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-medium text-white/90">
                {def.label}{" "}
                {!isSingle && (
                  <span className="text-white/40">({items.length})</span>
                )}
              </h2>
              <p className="mt-0.5 truncate text-xs text-white/40">
                On page: {def.onPage}
              </p>
            </div>
            {!isSingle && (
              <button
                onClick={startAdd}
                className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                + Add new
              </button>
            )}
          </div>

          {/* ------------------- singleton editor ------------------- */}
          {isSingle ? (
            <div className="mt-6">
              {loading ? (
                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                      <div className="h-9 w-full animate-pulse rounded-lg bg-white/[0.06]" />
                    </div>
                  ))}
                </div>
              ) : (
                <form
                  onSubmit={saveSingleton}
                  className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <FieldRows def={def} form={form} setForm={setForm} />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ------------------- collection list ------------------- */
            <div className="mt-4 space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`sk-${i}`}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
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
                <p className="py-8 text-center text-sm text-white/40">
                  Nothing here yet. Click “Add new”.
                </p>
              ) : (
                items.map((item) => {
                  const title = String(
                    (def.titleField && item[def.titleField]) ?? "(untitled)",
                  );
                  const img = imageField ? String(item[imageField] ?? "") : "";
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 sm:gap-4 sm:p-4"
                    >
                      {imageField && (
                        <div
                          className="relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40 bg-cover bg-center sm:w-28"
                          style={
                            img ? { backgroundImage: `url(${img})` } : undefined
                          }
                        >
                          {!img && (
                            <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold text-white/15">
                              {title.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {title}
                        </p>
                        {def.subField && (
                          <p className="truncate text-xs text-white/40">
                            {String(item[def.subField] ?? "")}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setPendingDelete(item)}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* editor modal (collections only) */}
      {!isSingle && editing !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d14] p-6"
          >
            <h3 className="text-lg font-semibold text-white">
              {editing === "new" ? "Add" : "Edit"} {def.singular}
            </h3>

            <div className="mt-5 space-y-4">
              <FieldRows def={def} form={form} setForm={setForm} />
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
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
            className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4"
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
              className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d14] p-6 text-center"
            >
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-500/10">
                <TriangleAlert className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                Delete this {def.singular.toLowerCase()}?
              </h3>
              <p className="mt-1 text-sm text-white/50">
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
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
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
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-xs flex-col gap-2">
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
              <p className="flex-1 text-sm text-white/90">{t.message}</p>
              <button
                onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))}
                className="text-white/40 transition-colors hover:text-white"
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
