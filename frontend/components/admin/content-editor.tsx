"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import Link from "next/link";
import { api, SessionExpired } from "./api";
import { ImagePicker, MediaPickerDialog, useMediaPicker } from "./media-picker";
import { RichText } from "./rich-text";
import {
  Button,
  Card,
  ErrorState,
  Field,
  PageHeader,
  Skeleton,
  StatusBadge,
  inputClass,
  useToast,
} from "./ui";
import { slugify } from "@/lib/utils";

/* -------------------------------------------------------------- */
/*  The editor behind both Posts and Pages.                        */
/*                                                                 */
/*  Publishing controls sit in a sidebar, the body fills the main   */
/*  column, and SEO lives in its own panel — the shape people      */
/*  already know from WordPress.                                    */
/* -------------------------------------------------------------- */

export interface EntryForm {
  title: string;
  slug: string;
  status: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  categories: string[];
  tags: string[];
  authorName: string;
  readTime: string;
  publishedAt: string;
  seo: {
    title: string;
    description: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    noindex: boolean;
  };
}

const EMPTY: EntryForm = {
  title: "",
  slug: "",
  status: "draft",
  excerpt: "",
  content: "",
  featuredImage: "",
  categories: [],
  tags: [],
  authorName: "",
  readTime: "",
  publishedAt: "",
  seo: {
    title: "",
    description: "",
    canonical: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    noindex: false,
  },
};

const STATUSES = ["draft", "published", "scheduled", "archived"];

export function ContentEditor({
  resource,
  singular,
  id,
  publicPath,
  withTaxonomy = false,
}: {
  resource: string;
  singular: string;
  /** "new" or a record id. */
  id: string;
  publicPath?: string;
  withTaxonomy?: boolean;
}) {
  const router = useRouter();
  const notify = useToast();
  const picker = useMediaPicker();

  const isNew = id === "new";
  const [form, setForm] = useState<EntryForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [dirty, setDirty] = useState(false);
  // A slug the admin typed is theirs; an untouched one keeps tracking the title.
  const [slugLocked, setSlugLocked] = useState(!isNew);

  const set = useCallback(<K extends keyof EntryForm>(key: K, value: EntryForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  const load = useCallback(async () => {
    if (isNew) return;
    setLoading(true);
    setLoadError("");
    try {
      const result = await api.get<Record<string, unknown>>(`/${resource}/${id}`);
      if (!result.ok || !result.data) {
        setLoadError(result.message || `That ${singular.toLowerCase()} was not found.`);
        return;
      }

      const record = result.data;
      setForm({
        ...EMPTY,
        ...record,
        publishedAt: record.publishedAt
          ? new Date(String(record.publishedAt)).toISOString().slice(0, 16)
          : "",
        seo: { ...EMPTY.seo, ...((record.seo as object) ?? {}) },
      } as EntryForm);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setLoadError("Could not load this record.");
    } finally {
      setLoading(false);
    }
  }, [id, isNew, resource, singular]);

  // Scheduled rather than called during the commit: the first thing load()
  // does is flip a loading flag, and React must not be told to re-render while
  // it is still committing this one.
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  // Warn before losing unsaved edits to a refresh or a closed tab.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save() {
    setSaving(true);
    setErrors({});

    const payload = {
      ...form,
      slug: form.slug || slugify(form.title, "item"),
      publishedAt: form.publishedAt || undefined,
    };

    try {
      const result = isNew
        ? await api.post<{ _id: string }>(`/${resource}`, payload)
        : await api.put<{ _id: string }>(`/${resource}/${id}`, payload);

      if (!result.ok) {
        setErrors(result.errors);
        notify("error", result.message || "Could not save.");
        return;
      }

      setDirty(false);
      notify("success", result.message || "Saved");

      if (isNew && result.data?._id) {
        router.replace(`/admin/${resource}/${result.data._id}`);
      }
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Edit ${singular.toLowerCase()}`} />
        <Skeleton rows={6} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <PageHeader title={singular} />
        <ErrorState message={loadError} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/${resource}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.02] text-ink-3 transition-colors hover:text-ink"
          aria-label={`Back to ${resource}`}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-ink">
            {isNew ? `New ${singular.toLowerCase()}` : form.title || singular}
          </h1>
          {!isNew && (
            <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-3">
              <StatusBadge status={form.status} />
              {publicPath && form.status === "published" && (
                <a
                  href={`${publicPath}/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          )}
        </div>
        <Button onClick={save} loading={saving} className="shrink-0">
          <Save className="h-4 w-4" />
          {isNew ? "Create" : "Save"}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* ------------------------ main ------------------------ */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="Title" error={errors.title}>
              <input
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugLocked) {
                    setForm((current) => ({
                      ...current,
                      slug: slugify(e.target.value, ""),
                    }));
                  }
                }}
                placeholder={`${singular} title`}
                className={inputClass}
              />
            </Field>

            <Field
              label="Slug"
              hint={publicPath ? `${publicPath}/${form.slug || "…"}` : undefined}
              error={errors.slug}
            >
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  set("slug", e.target.value);
                }}
                placeholder="auto-generated-from-title"
                className={inputClass}
              />
            </Field>

            <Field label="Excerpt" hint="A short summary for cards and search results.">
              <textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
          </Card>

          <Card>
            <p className="mb-3 text-xs font-medium text-ink-3">Content</p>
            <RichText
              value={form.content}
              onChange={(html) => set("content", html)}
              onPickImage={picker.pick}
            />
          </Card>

          <Card className="space-y-4">
            <p className="text-sm font-semibold text-ink">SEO</p>

            <Field label="Meta title" hint="Falls back to the title when empty.">
              <input
                value={form.seo.title}
                onChange={(e) => set("seo", { ...form.seo, title: e.target.value })}
                className={inputClass}
              />
            </Field>

            <Field label="Meta description" hint="Falls back to the excerpt.">
              <textarea
                value={form.seo.description}
                onChange={(e) =>
                  set("seo", { ...form.seo, description: e.target.value })
                }
                rows={2}
                className={inputClass}
              />
            </Field>

            <Field label="Canonical URL" hint="Only needed if this duplicates another page.">
              <input
                value={form.seo.canonical}
                onChange={(e) => set("seo", { ...form.seo, canonical: e.target.value })}
                placeholder="https://…"
                className={inputClass}
              />
            </Field>

            <Field label="Social share image" hint="Falls back to the featured image.">
              <ImagePicker
                value={form.seo.ogImage}
                onChange={(url) => set("seo", { ...form.seo, ogImage: url })}
                onPick={picker.pick}
                label="Share image"
              />
            </Field>

            <label className="flex items-center gap-2.5 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={form.seo.noindex}
                onChange={(e) => set("seo", { ...form.seo, noindex: e.target.checked })}
                className="h-4 w-4 accent-brand"
              />
              Ask search engines not to index this
            </label>
          </Card>
        </div>

        {/* ----------------------- sidebar ---------------------- */}
        <div className="space-y-4">
          <Card className="space-y-4">
            <p className="text-sm font-semibold text-ink">Publish</p>

            <Field label="Status" error={errors.status}>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            {(form.status === "scheduled" || form.status === "published") && (
              <Field
                label={form.status === "scheduled" ? "Goes live at" : "Published at"}
                error={errors.publishedAt}
              >
                <input
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) => set("publishedAt", e.target.value)}
                  className={inputClass}
                />
              </Field>
            )}

            <Button onClick={save} loading={saving} className="w-full">
              <Save className="h-4 w-4" />
              {isNew ? `Create ${singular.toLowerCase()}` : "Save changes"}
            </Button>
          </Card>

          <Card>
            <p className="mb-3 text-sm font-semibold text-ink">Featured image</p>
            <ImagePicker
              value={form.featuredImage}
              onChange={(url) => set("featuredImage", url)}
              onPick={picker.pick}
            />
          </Card>

          {withTaxonomy && (
            <Card className="space-y-4">
              <p className="text-sm font-semibold text-ink">Organisation</p>

              <Field label="Categories" hint="Comma separated.">
                <input
                  value={form.categories.join(", ")}
                  onChange={(e) =>
                    set(
                      "categories",
                      e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Tags" hint="Comma separated.">
                <input
                  value={form.tags.join(", ")}
                  onChange={(e) =>
                    set(
                      "tags",
                      e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Author">
                <input
                  value={form.authorName}
                  onChange={(e) => set("authorName", e.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Read time" hint="e.g. 6 min read">
                <input
                  value={form.readTime}
                  onChange={(e) => set("readTime", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </Card>
          )}
        </div>
      </div>

      <MediaPickerDialog open={picker.open} onClose={picker.close} />
    </div>
  );
}
