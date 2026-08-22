"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, query, SessionExpired } from "./api";
import { Button, EmptyState, SearchInput, useToast } from "./ui";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- */
/*  Media picker.                                                  */
/*                                                                 */
/*  The same grid the Media screen uses, in a dialog — every image  */
/*  field on every form picks from the one library rather than      */
/*  uploading its own copy.                                        */
/* -------------------------------------------------------------- */

export interface MediaItem {
  _id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string;
  title: string;
}

export function useMediaPicker() {
  const [open, setOpen] = useState(false);
  const resolver = useRef<((url: string | null) => void) | null>(null);

  /** Opens the dialog and resolves with the chosen URL (or null). */
  const pick = useCallback((): Promise<string | null> => {
    setOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((url: string | null) => {
    setOpen(false);
    resolver.current?.(url);
    resolver.current = null;
  }, []);

  return { open, pick, close };
}

export function MediaPickerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: (url: string | null) => void;
}) {
  const notify = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get<MediaItem[]>(
        `/media${query({ search, perPage: 48 })}`,
      );
      setItems(result.data ?? []);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [open, search, load]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });

      const result = await api.post<MediaItem>("/media", {
        dataUrl,
        filename: file.name,
      });

      if (!result.ok || !result.data) {
        notify("error", result.message || "Upload failed.");
        return;
      }

      notify("success", "Uploaded");
      onClose(result.data.url);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.href = "/admin/login";
      else notify("error", "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] flex items-end justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="card-elevated flex max-h-[92dvh] w-full max-w-4xl flex-col rounded-t-2xl sm:max-h-[85vh] sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h3 className="text-base font-semibold text-ink">Media library</h3>
              <button
                onClick={() => onClose(null)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-line px-5 py-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by file name or alt text…"
                />
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) upload(file);
                }}
              />
              <Button
                variant="secondary"
                onClick={() => fileInput.current?.click()}
                loading={uploading}
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-xl bg-white/[0.06]"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  title="No images yet"
                  description="Upload one to get started."
                />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {items.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => onClose(item.url)}
                      title={item.filename}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-bg-2 transition-colors hover:border-brand-2/50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.alt || item.filename}
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={cn(
                          "absolute inset-0 grid place-items-center bg-brand/40 opacity-0 transition-opacity",
                          "group-hover:opacity-100",
                        )}
                      >
                        <Check className="h-6 w-6 text-white" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {uploading && (
              <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-sm text-ink-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Image field: shows the current picture and opens the library to change it. */
export function ImagePicker({
  value,
  onChange,
  onPick,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  onPick: () => Promise<string | null>;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative aspect-[16/10] w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-bg/50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[11px] text-ink-3">
            No image
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            const url = await onPick();
            if (url) onChange(url);
          }}
          className="px-3 py-1.5 text-xs"
        >
          {value ? "Change" : "Choose image"}
        </Button>
        {value && (
          <Button
            variant="danger"
            onClick={() => onChange("")}
            className="px-3 py-1.5 text-xs"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
