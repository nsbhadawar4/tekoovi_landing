"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  FolderKanban,
  HelpCircle,
  type LucideIcon,
  LogOut,
  MessageSquareQuote,
  Trash2,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react";
import {
  SECTION_FIELDS,
  SECTION_KEYS,
  SECTION_LABELS,
  type SectionKey,
} from "@/backend/types";
import { SERVICE_ICON_NAMES } from "@/lib/icons";

type AdminItem = { id: string } & Record<string, unknown>;
type FormState = Record<string, string | boolean>;

/* Which field to show as the row title / subtitle in each section. */
const TITLE_FIELD: Record<SectionKey, string> = {
  projects: "name",
  services: "title",
  testimonials: "name",
  faqs: "q",
};
const SUB_FIELD: Record<SectionKey, string> = {
  projects: "category",
  services: "description",
  testimonials: "role",
  faqs: "a",
};

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
  projects: FolderKanban,
  services: Wrench,
  testimonials: MessageSquareQuote,
  faqs: HelpCircle,
};

/* Singular names for toast messages, e.g. "Project added". */
const SECTION_SINGULAR: Record<SectionKey, string> = {
  projects: "Project",
  services: "Service",
  testimonials: "Testimonial",
  faqs: "FAQ",
};

type Toast = { id: number; type: "success" | "error"; message: string };

const FIELD_LABELS: Record<string, string> = {
  q: "Question",
  a: "Answer",
  tech: "Tech (comma separated)",
  accent: "Accent (Tailwind gradient classes)",
  icon: "Icon",
  featured: "Featured",
};

const MULTILINE = new Set(["description", "quote", "a"]);

function labelFor(field: string): string {
  return FIELD_LABELS[field] ?? field.charAt(0).toUpperCase() + field.slice(1);
}

function emptyForm(section: SectionKey): FormState {
  const form: FormState = {};
  for (const field of SECTION_FIELDS[section]) {
    form[field] = field === "featured" ? false : "";
  }
  return form;
}

function formFromItem(section: SectionKey, item: AdminItem): FormState {
  const form: FormState = {};
  for (const field of SECTION_FIELDS[section]) {
    const value = item[field];
    if (field === "featured") form[field] = value === true;
    else if (field === "tech")
      form[field] = Array.isArray(value) ? value.join(", ") : String(value ?? "");
    else form[field] = String(value ?? "");
  }
  return form;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [section, setSection] = useState<SectionKey>("projects");
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

  // Manual refresh (used after add / edit / delete). Called from event
  // handlers, so setting state here is fine.
  const load = useCallback(async (key: SectionKey) => {
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
    fetch(`/api/content/${section}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { items?: AdminItem[] }) => {
        if (active) {
          setItems(data.items ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [section]);

  function selectSection(key: SectionKey) {
    if (key === section) return;
    setLoading(true);
    setEditing(null);
    setSection(key);
  }

  function startAdd() {
    setForm(emptyForm(section));
    setError("");
    setEditing("new");
  }

  function startEdit(item: AdminItem) {
    setForm(formFromItem(section, item));
    setError("");
    setEditing(item.id);
  }

  function unauthorized() {
    router.replace("/admin/login");
  }

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

    notify(
      "success",
      `${SECTION_SINGULAR[section]} ${isNew ? "added" : "updated"} successfully`,
    );
    setEditing(null);
    load(section);
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
    notify("success", `${SECTION_SINGULAR[section]} deleted`);
    load(section);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* sidebar */}
      <aside className="shrink-0 border-b border-white/10 md:w-60 md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <p className="text-sm font-semibold">Tekoovi Admin</p>
          <p className="mt-0.5 text-xs text-white/40">Landing page content</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-4">
          {SECTION_KEYS.map((key) => {
            const Icon = SECTION_ICONS[key];
            const active = key === section;
            return (
              <button
                key={key}
                onClick={() => selectSection(key)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-black"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {SECTION_LABELS[key]}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* main */}
      <div className="flex-1">
        {/* header */}
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold">Landing page admin</h1>
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
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-white/80">
              {SECTION_LABELS[section]}{" "}
              <span className="text-white/40">({items.length})</span>
            </h2>
            <button
              onClick={startAdd}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              + Add new
            </button>
          </div>

          {/* list */}
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
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {String(item[TITLE_FIELD[section]] ?? "(untitled)")}
                </p>
                <p className="truncate text-xs text-white/40">
                  {String(item[SUB_FIELD[section]] ?? "")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
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
          ))
        )}
      </div>

      {/* editor modal */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form
            onSubmit={save}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d14] p-6"
          >
            <h3 className="text-lg font-semibold">
              {editing === "new" ? "Add" : "Edit"} {SECTION_LABELS[section]}
            </h3>

            <div className="mt-5 space-y-4">
              {SECTION_FIELDS[section].map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-white/60">
                    {labelFor(field)}
                  </label>

                  {field === "featured" ? (
                    <label className="mt-2 flex items-center gap-2 text-sm text-white/80">
                      <input
                        type="checkbox"
                        checked={form[field] === true}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, [field]: e.target.checked }))
                        }
                      />
                      Highlight this service
                    </label>
                  ) : field === "icon" ? (
                    <select
                      value={String(form[field] ?? "")}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/30"
                    >
                      <option value="">— pick an icon —</option>
                      {SERVICE_ICON_NAMES.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : MULTILINE.has(field) ? (
                    <textarea
                      value={String(form[field] ?? "")}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/30"
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(form[field] ?? "")}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-white/30"
                    />
                  )}
                </div>
              ))}
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
        </div>
      </div>

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
              <h3 className="mt-4 text-lg font-semibold">
                Delete this {SECTION_SINGULAR[section].toLowerCase()}?
              </h3>
              <p className="mt-1 text-sm text-white/50">
                “{String(pendingDelete[TITLE_FIELD[section]] ?? "this item")}”
                will be permanently removed. This can&apos;t be undone.
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
                onClick={() =>
                  setToasts((l) => l.filter((x) => x.id !== t.id))
                }
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
