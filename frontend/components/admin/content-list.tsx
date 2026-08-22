"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { api, query, SessionExpired, type ApiMeta } from "./api";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  SearchInput,
  Skeleton,
  StatusBadge,
  inputClass,
  useToast,
} from "./ui";

/* -------------------------------------------------------------- */
/*  The list screen behind both Posts and Pages.                   */
/*                                                                 */
/*  Same table, same search, same filters, same delete flow — the  */
/*  two differ only in their endpoint, their labels and whether     */
/*  categories are shown.                                           */
/* -------------------------------------------------------------- */

export interface ContentRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  categories?: string[];
  updatedAt: string;
  publishedAt?: string;
}

const STATUSES = ["all", "published", "draft", "scheduled", "archived"];

export function ContentList({
  resource,
  singular,
  plural,
  description,
  publicPath,
  categories = [],
}: {
  /** API segment, e.g. "posts". */
  resource: string;
  singular: string;
  plural: string;
  description: string;
  /** Where the item lives on the site, e.g. "/blog" — omit for none. */
  publicPath?: string;
  categories?: { name: string }[];
}) {
  const notify = useToast();

  const [rows, setRows] = useState<ContentRow[]>([]);
  const [meta, setMeta] = useState<ApiMeta>({
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ContentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<ContentRow[]>(
        `/${resource}${query({ search, status, category, page })}`,
      );

      if (!result.ok) {
        setError(result.message || `Could not load ${plural.toLowerCase()}.`);
        return;
      }

      setRows(result.data ?? []);
      if (result.meta) setMeta(result.meta);
    } catch (err) {
      if (err instanceof SessionExpired) {
        window.location.assign("/admin/login");
        return;
      }
      setError(`Could not load ${plural.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [resource, search, status, category, page, plural]);

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  // Any filter change starts again from the first page. Done in the handlers
  // below rather than an effect, so no render is queued during a commit.
  const changeFilter = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const result = await api.remove(`/${resource}/${pendingDelete._id}`);
      if (!result.ok) {
        notify("error", result.message || "Could not delete.");
        return;
      }
      notify("success", `${singular} deleted`);
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
        title={plural}
        description={description}
        action={
          <Link href={`/admin/${resource}/new`}>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              New {singular.toLowerCase()}
            </Button>
          </Link>
        }
      />

      {/* ------------------------- filters ------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={changeFilter(setSearch)}
            placeholder={`Search ${plural.toLowerCase()}…`}
          />
        </div>

        <select
          value={status}
          onChange={(e) => changeFilter(setStatus)(e.target.value)}
          aria-label="Filter by status"
          className={`${inputClass} sm:w-44`}
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? "All statuses" : value}
            </option>
          ))}
        </select>

        {categories.length > 0 && (
          <select
            value={category}
            onChange={(e) => changeFilter(setCategory)(e.target.value)}
            aria-label="Filter by category"
            className={`${inputClass} sm:w-48`}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* -------------------------- table -------------------------- */}
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={
            search || status !== "all"
              ? "Nothing matches those filters"
              : `No ${plural.toLowerCase()} yet`
          }
          description={
            search || status !== "all"
              ? "Try a different search or status."
              : `Create your first ${singular.toLowerCase()} to see it here.`
          }
          action={
            <Link href={`/admin/${resource}/new`}>
              <Button>
                <Plus className="h-4 w-4" />
                New {singular.toLowerCase()}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={row._id}
              className="card-hairline flex flex-wrap items-center gap-3 rounded-xl p-3 transition-colors hover:border-white/15 sm:flex-nowrap sm:gap-4 sm:p-4"
            >
              <div className="min-w-0 flex-1 basis-40">
                <Link
                  href={`/admin/${resource}/${row._id}`}
                  className="block truncate text-sm font-medium text-ink hover:text-brand-3"
                >
                  {row.title}
                </Link>
                <p className="mt-0.5 truncate text-xs text-ink-3">
                  /{row.slug}
                  {row.categories && row.categories.length > 0 && (
                    <span> · {row.categories.join(", ")}</span>
                  )}
                </p>
              </div>

              <StatusBadge status={row.status} />

              <span className="hidden shrink-0 text-xs text-ink-3 lg:inline">
                {new Date(row.updatedAt).toLocaleDateString()}
              </span>

              <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                {publicPath && row.status === "published" && (
                  <a
                    href={`${publicPath}/${row.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on the site"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/[0.02] text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Link href={`/admin/${resource}/${row._id}`} className="flex-1 sm:flex-none">
                  <Button variant="secondary" className="w-full px-3 py-2 text-xs">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => setPendingDelete(row)}
                  className="flex-1 px-3 py-2 text-xs sm:flex-none"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              onChange={setPage}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete this ${singular.toLowerCase()}?`}
        message={`“${pendingDelete?.title}” will be permanently removed. This can't be undone.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
