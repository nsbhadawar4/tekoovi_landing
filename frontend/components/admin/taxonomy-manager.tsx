"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, query, SessionExpired } from "./api";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Skeleton,
  inputClass,
  useToast,
} from "./ui";

interface Term {
  _id: string;
  type: "category" | "tag";
  name: string;
  slug: string;
  description: string;
  postCount: number;
}

type Draft = { name: string; slug: string; description: string };

const BLANK: Draft = { name: "", slug: "", description: "" };

export function TaxonomyManager() {
  const notify = useToast();

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<Term | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [draftType, setDraftType] = useState<"category" | "tag">("category");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Term | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<Term[]>(`/terms${query({ perPage: 100 })}`);
      if (!result.ok) {
        setError(result.message || "Could not load categories and tags.");
        return;
      }
      setTerms(result.data ?? []);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setError("Could not load categories and tags.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Scheduled rather than called during the commit: the first thing load()
  // does is flip a loading flag, and React must not be told to re-render while
  // it is still committing this one.
  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  function startEdit(term: Term) {
    setEditing(term);
    setDraftType(term.type);
    setDraft({ name: term.name, slug: term.slug, description: term.description });
    setErrors({});
  }

  function startCreate(type: "category" | "tag") {
    setEditing(null);
    setDraftType(type);
    setDraft(BLANK);
    setErrors({});
  }

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const payload = { ...draft, type: draftType };
      const result = editing
        ? await api.put(`/terms/${editing._id}`, payload)
        : await api.post("/terms", payload);

      if (!result.ok) {
        setErrors(result.errors);
        notify("error", result.message || "Could not save.");
        return;
      }

      notify("success", editing ? "Saved" : `${draftType} created`);
      setDraft(BLANK);
      setEditing(null);
      load();
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await api.remove(`/terms/${pendingDelete._id}`);

      if (!result.ok) {
        // 409: posts still use it. The message names how many.
        notify("error", result.message || "Could not delete.");
        setPendingDelete(null);
        return;
      }

      notify("success", "Deleted");
      setPendingDelete(null);
      if (editing?._id === pendingDelete._id) {
        setEditing(null);
        setDraft(BLANK);
      }
      load();
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  const groups = [
    { type: "category" as const, title: "Categories" },
    { type: "tag" as const, title: "Tags" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories & Tags"
        description="How posts are grouped on the blog."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {loading ? (
            <Skeleton rows={5} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            groups.map((group) => {
              const rows = terms.filter((term) => term.type === group.type);

              return (
                <div key={group.type}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-ink">
                      {group.title}{" "}
                      <span className="text-ink-3">({rows.length})</span>
                    </h2>
                    <Button
                      variant="secondary"
                      onClick={() => startCreate(group.type)}
                      className="px-3 py-1.5 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New
                    </Button>
                  </div>

                  {rows.length === 0 ? (
                    <EmptyState title={`No ${group.title.toLowerCase()} yet`} />
                  ) : (
                    <div className="space-y-2">
                      {rows.map((term) => (
                        <div
                          key={term._id}
                          className="card-hairline flex flex-wrap items-center gap-3 rounded-xl p-3 sm:flex-nowrap sm:p-4"
                        >
                          <div className="min-w-0 flex-1 basis-40">
                            <p className="truncate text-sm font-medium text-ink">
                              {term.name}
                            </p>
                            <p className="truncate text-xs text-ink-3">/{term.slug}</p>
                          </div>

                          <span className="shrink-0 rounded-full border border-line px-2.5 py-0.5 text-[11px] text-ink-3">
                            {term.postCount} post{term.postCount === 1 ? "" : "s"}
                          </span>

                          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                            <Button
                              variant="secondary"
                              onClick={() => startEdit(term)}
                              className="flex-1 px-3 py-2 text-xs sm:flex-none"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => setPendingDelete(term)}
                              className="flex-1 px-3 py-2 text-xs sm:flex-none"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ------------------------ editor ------------------------ */}
        <Card className="h-fit space-y-4">
          <p className="text-sm font-semibold text-ink">
            {editing ? `Edit ${editing.type}` : `New ${draftType}`}
          </p>

          {!editing && (
            <Field label="Type">
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value as "category" | "tag")}
                className={inputClass}
              >
                <option value="category">Category</option>
                <option value="tag">Tag</option>
              </select>
            </Field>
          )}

          <Field label="Name" error={errors.name}>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field
            label="Slug"
            hint="Leave blank to generate from the name."
            error={errors.slug}
          >
            <input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className={inputClass}
            />
          </Field>

          <div className="flex gap-2">
            <Button onClick={save} loading={saving} className="flex-1">
              {editing ? "Save" : "Create"}
            </Button>
            {editing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setDraft(BLANK);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete this ${pendingDelete?.type}?`}
        message={`“${pendingDelete?.name}” will be removed. Posts using it keep the label until you edit them.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
