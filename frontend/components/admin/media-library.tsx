"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { api, query, SessionExpired, type ApiMeta } from "./api";
import type { MediaItem } from "./media-picker";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Pagination,
  SearchInput,
  inputClass,
  useToast,
} from "./ui";

/** 1.4 MB — a size people can reason about. */
function fileSize(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`;
}

export function MediaLibrary() {
  const notify = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({
    page: 1,
    perPage: 24,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<MediaItem[]>(`/media${query({ search, page })}`);
      if (!result.ok) {
        setError(result.message || "Could not load the media library.");
        return;
      }
      setItems(result.data ?? []);
      if (result.meta) setMeta(result.meta);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setError("Could not load the media library.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);



  async function upload(files: FileList) {
    setUploading(true);
    let uploaded = 0;

    try {
      for (const file of Array.from(files)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("read failed"));
          reader.readAsDataURL(file);
        });

        const result = await api.post<MediaItem>("/media", {
          dataUrl,
          filename: file.name,
        });

        if (result.ok) uploaded += 1;
        else notify("error", `${file.name}: ${result.message}`);
      }

      if (uploaded > 0) {
        notify("success", `${uploaded} file${uploaded === 1 ? "" : "s"} uploaded`);
        load();
      }
    } catch (err) {
      if (err instanceof SessionExpired) window.location.href = "/admin/login";
      else notify("error", "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function saveMeta() {
    if (!selected) return;
    setSavingMeta(true);
    try {
      const result = await api.put<MediaItem>(`/media/${selected._id}`, {
        alt: selected.alt,
        title: selected.title,
      });

      if (!result.ok) {
        notify("error", result.message || "Could not save.");
        return;
      }

      notify("success", "Saved");
      setItems((list) =>
        list.map((item) => (item._id === selected._id ? { ...item, ...selected } : item)),
      );
    } catch (err) {
      if (err instanceof SessionExpired) window.location.href = "/admin/login";
      else notify("error", "Could not save.");
    } finally {
      setSavingMeta(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await api.remove(`/media/${pendingDelete._id}`);

      if (!result.ok) {
        // 409 means the image is still on a page — say where.
        notify("error", result.message || "Could not delete.");
        return;
      }

      notify("success", "Deleted");
      if (selected?._id === pendingDelete._id) setSelected(null);
      setPendingDelete(null);
      load();
    } catch (err) {
      if (err instanceof SessionExpired) window.location.href = "/admin/login";
      else notify("error", "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        description="Every image on the site, in one place."
        action={
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                e.target.value = "";
                if (files?.length) upload(files);
              }}
            />
            <Button
              onClick={() => fileInput.current?.click()}
              loading={uploading}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </>
        }
      />

      <SearchInput
        value={search}
        onChange={(value) => {
          // Reset to the first page here rather than in an effect.
          setSearch(value);
          setPage(1);
        }}
        placeholder="Search by file name, alt text or title…"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-white/[0.06]"
                />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : items.length === 0 ? (
            <EmptyState
              title={search ? "Nothing matches that search" : "The library is empty"}
              description={
                search ? "Try a different term." : "Upload your first image to begin."
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`group relative aspect-square overflow-hidden rounded-xl border bg-bg-2 transition-colors ${
                      selected?._id === item._id
                        ? "border-brand-2/70 ring-1 ring-brand-2/40"
                        : "border-line hover:border-white/20"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.alt || item.filename}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-left text-[10px] text-white/90 backdrop-blur">
                      {item.filename}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  onChange={setPage}
                />
              </div>
            </>
          )}
        </div>

        {/* ---------------------- details ---------------------- */}
        <Card className="h-fit">
          {selected ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line bg-bg-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt={selected.alt || selected.filename}
                  className="max-h-48 w-full object-contain"
                />
              </div>

              <dl className="space-y-1 text-xs text-ink-3">
                <div className="flex justify-between gap-2">
                  <dt>File</dt>
                  <dd className="truncate text-ink-2">{selected.filename}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Type</dt>
                  <dd className="text-ink-2">{selected.contentType}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Size</dt>
                  <dd className="text-ink-2">{fileSize(selected.size)}</dd>
                </div>
              </dl>

              <Field label="Alt text" hint="Describes the image for screen readers.">
                <input
                  value={selected.alt}
                  onChange={(e) => setSelected({ ...selected, alt: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Title">
                <input
                  value={selected.title}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveMeta} loading={savingMeta} className="flex-1">
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${window.location.origin}${selected.url}`,
                    );
                    notify("success", "URL copied");
                  }}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setPendingDelete(selected)}
                  className="px-3"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-ink-3">
              Select an image to see its details.
            </p>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this image?"
        message={`“${pendingDelete?.filename}” will be removed. Anything still using it will show a broken image.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
