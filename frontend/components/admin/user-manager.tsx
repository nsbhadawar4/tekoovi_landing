"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, SessionExpired } from "./api";
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  Field,
  PageHeader,
  Skeleton,
  inputClass,
  useToast,
} from "./ui";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  lastLoginAt?: string;
  createdAt: string;
}

type Draft = { name: string; email: string; password: string; role: "admin" | "editor" };

const BLANK: Draft = { name: "", email: "", password: "", role: "editor" };

export function UserManager({ currentUserId }: { currentUserId: string }) {
  const notify = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<User | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.get<User[]>("/users");
      if (!result.ok) {
        setError(result.message || "Could not load users.");
        return;
      }
      setUsers(result.data ?? []);
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else setError("Could not load users.");
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

  async function save() {
    setSaving(true);
    setErrors({});
    try {
      const result = editing
        ? await api.put(`/users/${editing._id}`, {
            name: draft.name,
            role: draft.role,
            // Blank means "leave the current password alone".
            ...(draft.password ? { password: draft.password } : {}),
          })
        : await api.post("/users", draft);

      if (!result.ok) {
        setErrors(result.errors);
        notify("error", result.message || "Could not save.");
        return;
      }

      notify("success", editing ? "User updated" : "User created");
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
      const result = await api.remove(`/users/${pendingDelete._id}`);

      if (!result.ok) {
        notify("error", result.message || "Could not delete.");
        setPendingDelete(null);
        return;
      }

      notify("success", "User deleted");
      setPendingDelete(null);
      load();
    } catch (err) {
      if (err instanceof SessionExpired) window.location.assign("/admin/login");
      else notify("error", "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Who can sign in, and what they may change."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          {loading ? (
            <Skeleton rows={3} />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="card-hairline flex flex-wrap items-center gap-3 rounded-xl p-3 sm:flex-nowrap sm:p-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full btn-brand text-sm font-bold text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate text-sm font-medium text-ink">
                      {user.name}
                      {user._id === currentUserId && (
                        <span className="ml-2 text-[11px] text-ink-3">(you)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-3">{user.email}</p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${
                      user.role === "admin"
                        ? "border-brand-2/40 bg-brand/10 text-brand-3"
                        : "border-line text-ink-3"
                    }`}
                  >
                    {user.role}
                  </span>

                  <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditing(user);
                        setDraft({
                          name: user.name,
                          email: user.email,
                          password: "",
                          role: user.role,
                        });
                        setErrors({});
                      }}
                      className="flex-1 px-3 py-2 text-xs sm:flex-none"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setPendingDelete(user)}
                      disabled={user._id === currentUserId}
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

        {/* ------------------------ editor ------------------------ */}
        <Card className="h-fit space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">
              {editing ? "Edit user" : "New user"}
            </p>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setDraft(BLANK);
                }}
                className="text-xs text-ink-3 hover:text-ink"
              >
                Cancel
              </button>
            )}
          </div>

          <Field label="Name" error={errors.name}>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field
            label="Email"
            hint={editing ? "The sign-in address can't be changed." : undefined}
            error={errors.email}
          >
            <input
              type="email"
              value={draft.email}
              disabled={Boolean(editing)}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              className={`${inputClass} disabled:opacity-60`}
            />
          </Field>

          <Field
            label={editing ? "New password" : "Password"}
            hint={editing ? "Leave blank to keep the current one." : "At least 8 characters."}
            error={errors.password}
          >
            <input
              type="password"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              className={inputClass}
            />
          </Field>

          <Field
            label="Role"
            hint="Editors manage content. Admins also manage settings and users."
            error={errors.role}
          >
            <select
              value={draft.role}
              onChange={(e) =>
                setDraft({ ...draft, role: e.target.value as "admin" | "editor" })
              }
              className={inputClass}
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <Button onClick={save} loading={saving} className="w-full">
            {!editing && <Plus className="h-4 w-4" />}
            {editing ? "Save changes" : "Create user"}
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this user?"
        message={`${pendingDelete?.name} will lose access immediately.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
